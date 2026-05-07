"""
views_customer.py
All views accessible by the customer/student role.
Public endpoints (no auth) are also here.
"""

import json
import uuid
from datetime import date

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import (
    Course, Job, Application, Enrollment, Lesson,
    LessonProgress, Quiz, QuizAttempt, Certificate,
    Notification, Event, EventRegistration, ExtraCertificate, UserProject,
)
from .serializers import (
    CourseSerializer, CourseListSerializer, JobSerializer, UserSerializer,
    EnrollmentSerializer, CertificateSerializer, ApplicationSerializer,
    QuizSerializer, QuizAttemptSerializer
)

User = get_user_model()


# ─────────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"message": "Leapfrog Connect API running ✅"})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_courses(request):
    """List all active courses. Supports ?category=&level=&search= filters."""
    courses = Course.objects.filter(is_active=True).select_related('category').prefetch_related('lessons')

    category = request.query_params.get('category')
    level = request.query_params.get('level')
    search = request.query_params.get('search')

    if category:
        courses = courses.filter(category__name__icontains=category)
    if level:
        courses = courses.filter(level=level)
    if search:
        courses = courses.filter(title__icontains=search)

    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_course_detail(request, pk):
    try:
        course = Course.objects.prefetch_related('lessons').select_related('category').get(pk=pk, is_active=True)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    return Response(CourseSerializer(course).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_jobs(request):
    """List all active jobs. Supports ?type=&search= filters."""
    jobs = Job.objects.filter(is_active=True).order_by('-created_at')

    job_type = request.query_params.get('type')
    search = request.query_params.get('search')

    if job_type:
        jobs = jobs.filter(job_type=job_type)
    if search:
        jobs = jobs.filter(title__icontains=search)

    return Response(JobSerializer(jobs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_job_detail(request, pk):
    try:
        job = Job.objects.get(pk=pk, is_active=True)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)
    return Response(JobSerializer(job).data)


# ─────────────────────────────────────────────
# AUTH / REGISTRATION
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"error": "An account with this email already exists"}, status=400)

    User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='customer',
    )
    return Response({"message": "Account created successfully"}, status=201)


# ─────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    return Response(UserSerializer(request.user).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    fields = ['first_name', 'last_name', 'email', 'bio', 'headline',
              'location', 'github', 'linkedin', 'website', 'avatar']
    for field in fields:
        if field in data:
            setattr(user, field, data[field])

    skills = data.get('skills')
    if skills is not None:
        user.set_skills_list(skills if isinstance(skills, list) else json.loads(skills))

    user.save()
    return Response(UserSerializer(user).data)


# ─────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    user = request.user
    enrollments = Enrollment.objects.filter(user=user).select_related('course')
    applications = Application.objects.filter(user=user)
    certificates = Certificate.objects.filter(user=user)

    # Streak tracking
    today = date.today()
    if user.last_active != today:
        if user.last_active and (today - user.last_active).days == 1:
            user.streak += 1
        else:
            user.streak = 1
        user.last_active = today
        user.save(update_fields=['streak', 'last_active'])

    # Progress — recalculate live from LessonProgress so it's always accurate
    course_progress = []
    for en in enrollments:
        total = en.course.lessons.count()
        if total > 0:
            done = LessonProgress.objects.filter(
                user=user, lesson__course=en.course, completed=True
            ).count()
            live_progress = int((done / total) * 100)
            # Sync enrollment.progress if out of date
            if en.progress != live_progress:
                en.progress = live_progress
                en.save(update_fields=['progress'])
        else:
            live_progress = en.progress  # no lessons yet, use stored value

        course_progress.append({
            'course': en.course.title[:20],  # trim for chart readability
            'course_id': en.course.id,
            'progress': live_progress,
            'completed': en.completed,
        })

    # Trending courses (most enrolled, limit 4)
    from django.db.models import Count
    trending = Course.objects.filter(is_active=True).annotate(
        enroll_count=Count('enrollment')
    ).order_by('-enroll_count', '-created_at')[:4]

    # Latest jobs (limit 3)
    latest_jobs = Job.objects.filter(is_active=True).order_by('-created_at')[:3]

    # Upcoming events
    from django.utils import timezone as tz
    upcoming_events = Event.objects.filter(
        status__in=['upcoming', 'ongoing'],
        end_date__gte=tz.now()
    ).order_by('start_date')[:3]

    # My event registrations (for badge)
    my_event_ids = EventRegistration.objects.filter(
        user=user, status__in=['registered', 'waitlisted']
    ).values_list('event_id', flat=True)

    return Response({
        "courses_enrolled":   enrollments.count(),
        "completed_courses":  enrollments.filter(completed=True).count(),
        "jobs_applied":       applications.count(),
        "certificates":       certificates.count(),
        "streak":             user.streak,
        "course_progress":    course_progress,
        "trending_courses": [{
            'id': c.id, 'title': c.title, 'level': c.level,
            'thumbnail': c.thumbnail, 'duration': c.duration,
            'enroll_count': c.enroll_count,
            'category': c.category.name if c.category else None,
        } for c in trending],
        "latest_jobs": [{
            'id': j.id, 'title': j.title, 'company': j.company,
            'location': j.location, 'job_type': j.job_type,
            'salary_range': j.salary_range, 'company_logo': j.company_logo,
        } for j in latest_jobs],
        "upcoming_events": [{
            'id': e.id, 'title': e.title, 'event_type': e.event_type,
            'start_date': e.start_date, 'location': e.location,
            'is_free': e.is_free, 'thumbnail': e.thumbnail,
            'registered': e.id in my_event_ids,
            'is_full': e.is_full,
        } for e in upcoming_events],
    })


# ─────────────────────────────────────────────
# COURSE SYSTEM
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    course_id = request.data.get('course_id')
    try:
        course = Course.objects.get(id=course_id, is_active=True)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
    if not created:
        return Response({"error": "Already enrolled"}, status=400)

    # Notify all admins
    admins = User.objects.filter(role='admin', is_active=True)
    admin_notifs = [Notification(
        user=a, type='status',
        title=f"New enrollment: {course.title}",
        message=f"{request.user.get_full_name() or request.user.username} enrolled in '{course.title}'.",
        link='/admin/courses'
    ) for a in admins]
    if admin_notifs:
        Notification.objects.bulk_create(admin_notifs)

    return Response({"message": "Enrolled successfully", "enrollment_id": enrollment.id}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    enrollments = (
        Enrollment.objects
        .filter(user=request.user)
        .select_related('course', 'course__category')
        .prefetch_related('course__lessons')
    )
    return Response(EnrollmentSerializer(enrollments, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request):
    lesson_id = request.data.get('lesson_id')
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    try:
        enrollment = Enrollment.objects.get(user=request.user, course=lesson.course)
    except Enrollment.DoesNotExist:
        return Response({"error": "Not enrolled in this course"}, status=403)

    lp, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
    if not lp.completed:
        lp.completed = True
        lp.completed_at = timezone.now()
        lp.save()

    # Recalculate progress
    total = lesson.course.lessons.count()
    done = LessonProgress.objects.filter(
        user=request.user, lesson__course=lesson.course, completed=True
    ).count()
    progress = int((done / total) * 100) if total else 0
    enrollment.progress = progress

    if progress == 100 and not enrollment.completed:
        enrollment.completed = True
        enrollment.completed_at = timezone.now()
        # Auto-issue certificate
        cert, created = Certificate.objects.get_or_create(
            user=request.user, course=lesson.course,
            defaults={'certificate_id': f"CERT-{uuid.uuid4().hex[:10].upper()}"}
        )
        if created:
            Notification.objects.create(
                user=request.user, type='certificate',
                title=f"Certificate Earned! 🎓",
                message=f"You completed '{lesson.course.title}' and earned your certificate.",
                link='/certificates'
            )

    enrollment.save()
    return Response({"message": "Lesson marked complete", "progress": progress, "course_completed": enrollment.completed})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_progress(request, course_id):
    try:
        Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    completed_ids = LessonProgress.objects.filter(
        user=request.user, lesson__course_id=course_id, completed=True
    ).values_list('lesson_id', flat=True)

    return Response({"completed_lessons": list(completed_ids)})


# ─────────────────────────────────────────────
# QUIZ SYSTEM
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, course_id):
    enrollment = Enrollment.objects.filter(
        user=request.user, course_id=course_id, completed=True
    ).first()
    if not enrollment:
        return Response({"error": "Complete the course first to access the quiz"}, status=403)

    try:
        quiz = Quiz.objects.prefetch_related('questions').get(course_id=course_id)
    except Quiz.DoesNotExist:
        return Response({"error": "No quiz available for this course"}, status=404)

    return Response(QuizSerializer(quiz).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)

    answers = request.data.get('answers', {})
    mcq_questions = quiz.questions.filter(question_type='mcq')
    total = mcq_questions.count()
    correct = sum(
        1 for q in mcq_questions
        if answers.get(str(q.id), '').upper() == q.correct_answer.upper()
    )

    score = round((correct / total * 100), 2) if total else 0
    passed = score >= quiz.pass_percentage

    attempt = QuizAttempt.objects.create(
        user=request.user, quiz=quiz,
        score=score, passed=passed,
        answers=json.dumps(answers)
    )

    certificate = None
    if passed:
        cert, _ = Certificate.objects.get_or_create(
            user=request.user, course=quiz.course,
            defaults={'certificate_id': f"LFC-{uuid.uuid4().hex[:10].upper()}"}
        )
        from .serializers import CertificateSerializer
        certificate = CertificateSerializer(cert).data

    return Response({
        "score": score,
        "passed": passed,
        "correct": correct,
        "total": total,
        "certificate": certificate,
        "attempt_id": attempt.id,
    })


# ─────────────────────────────────────────────
# CERTIFICATES
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_certificates(request):
    certs = Certificate.objects.filter(user=request.user).select_related('course')
    return Response(CertificateSerializer(certs, many=True).data)


# ─────────────────────────────────────────────
# JOB APPLICATIONS
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request):
    job_id = request.data.get('job_id')
    cover_letter = request.data.get('cover_letter', '')

    try:
        job = Job.objects.get(id=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)

    if job.required_certificate:
        has_cert = Certificate.objects.filter(user=request.user, course=job.required_certificate).exists()
        if not has_cert:
            return Response({
                "error": f"You need the '{job.required_certificate.title}' certificate to apply."
            }, status=403)

    app, created = Application.objects.get_or_create(
        user=request.user, job=job,
        defaults={'cover_letter': cover_letter}
    )
    if not created:
        return Response({"error": "Already applied"}, status=400)

    # Notify the HR who posted the job
    if job.created_by:
        Notification.objects.create(
            user=job.created_by,
            type='status',
            title=f"New application: {job.title}",
            message=f"{request.user.get_full_name() or request.user.username} applied for '{job.title}' at {job.company}.",
            link='/hr/applications'
        )

    return Response({"message": "Applied successfully", "application_id": app.id}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    applications = (
        Application.objects
        .filter(user=request.user)
        .select_related('job', 'job__required_certificate')
    )
    return Response(ApplicationSerializer(applications, many=True).data)