"""
views_admin.py
All views accessible only by Admin role.
Admin can manage courses, lessons, quizzes, users, and view platform analytics.
"""

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    Course, CourseCategory, Lesson, Quiz, Question,
    Enrollment, Certificate, Job, Application, User as UserModel
)
from .serializers import (
    CourseSerializer, CourseCategorySerializer, LessonSerializer,
    QuizSerializer, QuestionAdminSerializer, UserAdminSerializer, JobSerializer
)
from .permissions import IsAdmin

User = get_user_model()


# ─────────────────────────────────────────────
# ANALYTICS DASHBOARD
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    """Platform-wide analytics for admin."""
    return Response({
        "total_users": User.objects.count(),
        "total_customers": User.objects.filter(role='customer').count(),
        "total_admins": User.objects.filter(role='admin').count(),
        "total_hr": User.objects.filter(role='hr').count(),
        "total_courses": Course.objects.count(),
        "active_courses": Course.objects.filter(is_active=True).count(),
        "total_jobs": Job.objects.count(),
        "active_jobs": Job.objects.filter(is_active=True).count(),
        "total_enrollments": Enrollment.objects.count(),
        "completed_enrollments": Enrollment.objects.filter(completed=True).count(),
        "total_certificates": Certificate.objects.count(),
        "total_applications": Application.objects.count(),
        "applications_by_status": {
            s: Application.objects.filter(status=s).count()
            for s, _ in Application.STATUS_CHOICES
        },
    })


# ─────────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_all_users(request):
    """List all users with full admin detail. Supports ?role= filter."""
    users = User.objects.all().order_by('-date_joined')
    role = request.query_params.get('role')
    if role:
        users = users.filter(role=role)
    return Response(UserAdminSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    return Response(UserAdminSerializer(user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_user_role(request):
    """Change a user's role. Body: {user_id, role}"""
    user_id = request.data.get('user_id')
    new_role = request.data.get('role')

    valid_roles = [r for r, _ in UserModel.ROLE_CHOICES]
    if new_role not in valid_roles:
        return Response({"error": f"Invalid role. Choose from: {valid_roles}"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if user == request.user:
        return Response({"error": "You cannot change your own role"}, status=400)

    user.role = new_role
    user.save(update_fields=['role'])
    return Response({"message": f"Role updated to '{new_role}' for {user.username}"})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    if user == request.user:
        return Response({"error": "You cannot delete your own account"}, status=400)
    username = user.username
    user.delete()
    return Response({"message": f"User '{username}' permanently deleted"})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def toggle_user_active(request, user_id):
    """Activate or deactivate a user account."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if user == request.user:
        return Response({"error": "You cannot deactivate your own account"}, status=400)

    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    status_str = "activated" if user.is_active else "deactivated"
    return Response({"message": f"User {status_str} successfully"})


# ─────────────────────────────────────────────
# COURSE MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_course(request):
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        course = serializer.save(created_by=request.user)
        # Notify all customers
        from .models import Notification
        customers = User.objects.filter(role='customer', is_active=True)
        notifs = [Notification(
            user=c, type='new_course',
            title=f"New Course: {course.title}",
            message=f"A new {course.level} course '{course.title}' is now available. Start learning today!",
            link='/courses'
        ) for c in customers]
        Notification.objects.bulk_create(notifs)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_course(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    serializer = CourseSerializer(course, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_course(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    course.is_active = False  # Soft delete
    course.save(update_fields=['is_active'])
    return Response({"message": "Course deactivated"})


# ─────────────────────────────────────────────
# LESSON MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_lesson(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    serializer = LessonSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_lesson(request, lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    serializer = LessonSerializer(lesson, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_lesson(request, lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)
    lesson.delete()
    return Response({"message": "Lesson deleted"})


# ─────────────────────────────────────────────
# QUIZ MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_quiz(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    if Quiz.objects.filter(course=course).exists():
        return Response({"error": "Quiz already exists for this course"}, status=400)

    serializer = QuizSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def add_question(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)

    serializer = QuestionAdminSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(quiz=quiz)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
# CATEGORY MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_categories(request):
    cats = CourseCategory.objects.all()
    return Response(CourseCategorySerializer(cats, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_category(request):
    serializer = CourseCategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_category(request, category_id):
    try:
        cat = CourseCategory.objects.get(id=category_id)
    except CourseCategory.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)
    cat.delete()
    return Response({"message": "Category deleted"})