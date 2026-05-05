# from django.contrib.auth import get_user_model
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework import status

# from .models import Course, Job, Application, Enrollment
# from .serializers import CourseSerializer, JobSerializer, UserSerializer

# User = get_user_model()

# # -------------------------
# # 🔓 PUBLIC APIs
# # -------------------------

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def test(request):
#     return Response({"message": "Backend working"})


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def get_courses(request):
#     courses = Course.objects.all()
#     serializer = CourseSerializer(courses, many=True)
#     return Response(serializer.data)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def get_jobs(request):
#     jobs = Job.objects.all()
#     serializer = JobSerializer(jobs, many=True)
#     return Response(serializer.data)


# # -------------------------
# # 🔐 AUTH / USER
# # -------------------------

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_profile(request):
#     user = request.user
#     serializer = UserSerializer(user)
#     return Response(serializer.data)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register(request):
#     email = request.data.get('email')
#     password = request.data.get('password')

#     if not email or not password:
#         return Response({"error": "Email and password required"}, status=400)

#     if User.objects.filter(username=email).exists():
#         return Response({"error": "User already exists"}, status=400)

#     User.objects.create_user(
#         username=email,
#         email=email,
#         password=password
#     )

#     return Response({"message": "User created"}, status=201)


# # -------------------------
# # 💼 JOB SYSTEM
# # -------------------------

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def apply_job(request):
#     user = request.user
#     job_id = request.data.get('job_id')

#     try:
#         job = Job.objects.get(id=job_id)
#     except Job.DoesNotExist:
#         return Response({"error": "Job not found"}, status=404)

#     if Application.objects.filter(user=user, job=job).exists():
#         return Response({"error": "Already applied"}, status=400)

#     Application.objects.create(user=user, job=job)

#     return Response({"message": "Applied successfully"})


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_applications(request):
#     applications = Application.objects.filter(user=request.user)

#     data = []
#     for app in applications:
#         job_data = JobSerializer(app.job).data
#         job_data['status'] = app.status
#         data.append(job_data)

#     return Response(data)


# # -------------------------
# # 🎓 COURSE SYSTEM
# # -------------------------

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def enroll_course(request):
#     user = request.user
#     course_id = request.data.get('course_id')

#     try:
#         course = Course.objects.get(id=course_id)
#     except Course.DoesNotExist:
#         return Response({"error": "Course not found"}, status=404)

#     if Enrollment.objects.filter(user=user, course=course).exists():
#         return Response({"error": "Already enrolled"}, status=400)

#     Enrollment.objects.create(user=user, course=course)

#     return Response({"message": "Enrolled successfully"})


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_courses(request):
#     enrollments = Enrollment.objects.filter(user=request.user)
#     courses = [en.course for en in enrollments]

#     serializer = CourseSerializer(courses, many=True)
#     return Response(serializer.data)



# # profile
# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_profile(request):
#     user = request.user
#     data = request.data

#     user.username = data.get('username', user.username)
#     user.email = data.get('email', user.email)
#     user.bio = data.get('bio', user.bio)

#     # 🔥 skills should be list → convert to string or keep JSON (based on model)
#     skills = data.get('skills')
#     if skills is not None:
#         user.skills = skills

#     user.save()

#     return Response({"message": "Profile updated"})






import json
import uuid
from datetime import date, timezone as dt_timezone

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from .models import (
    Course, Job, Application, Enrollment, Lesson,
    LessonProgress, Quiz, Question, QuizAttempt, Certificate
)
from .serializers import (
    CourseSerializer, CourseListSerializer, JobSerializer, UserSerializer,
    EnrollmentSerializer, CertificateSerializer, ApplicationSerializer,
    QuizSerializer, QuizAttemptSerializer, LessonSerializer
)

User = get_user_model()


# ─────────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def test(request):
    return Response({"message": "Leapfrog Connect API running ✅"})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_courses(request):
    courses = Course.objects.all().prefetch_related('lessons')
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_course_detail(request, pk):
    try:
        course = Course.objects.prefetch_related('lessons').get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    serializer = CourseSerializer(course)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_jobs(request):
    jobs = Job.objects.filter(is_active=True).order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_job_detail(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)
    serializer = JobSerializer(job)
    return Response(serializer.data)


# ─────────────────────────────────────────────
# AUTH / USER
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    return Response({"message": "Account created successfully"}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.bio = data.get('bio', user.bio)
    user.headline = data.get('headline', user.headline)
    user.location = data.get('location', user.location)
    user.github = data.get('github', user.github)
    user.linkedin = data.get('linkedin', user.linkedin)
    user.website = data.get('website', user.website)
    user.avatar = data.get('avatar', user.avatar)

    skills = data.get('skills')
    if skills is not None:
        if isinstance(skills, list):
            user.set_skills_list(skills)
        else:
            user.skills = skills

    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    user = request.user
    enrollments = Enrollment.objects.filter(user=user).select_related('course')
    applications = Application.objects.filter(user=user)
    certificates = Certificate.objects.filter(user=user)

    # Update streak
    today = date.today()
    if user.last_active != today:
        if user.last_active and (today - user.last_active).days == 1:
            user.streak += 1
        elif user.last_active and (today - user.last_active).days > 1:
            user.streak = 1
        else:
            user.streak = 1
        user.last_active = today
        user.save(update_fields=['streak', 'last_active'])

    # Progress per course
    course_progress = []
    for en in enrollments:
        course_progress.append({
            "course": en.course.title,
            "progress": en.progress,
        })

    return Response({
        "courses_enrolled": enrollments.count(),
        "jobs_applied": applications.count(),
        "certificates": certificates.count(),
        "streak": user.streak,
        "course_progress": course_progress,
        "completed_courses": enrollments.filter(completed=True).count(),
    })


# ─────────────────────────────────────────────
# COURSE SYSTEM
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    user = request.user
    course_id = request.data.get('course_id')

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    enrollment, created = Enrollment.objects.get_or_create(user=user, course=course)
    if not created:
        return Response({"error": "Already enrolled"}, status=400)

    return Response({"message": "Enrolled successfully", "enrollment_id": enrollment.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    enrollments = Enrollment.objects.filter(user=request.user).select_related('course').prefetch_related('course__lessons')
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request):
    user = request.user
    lesson_id = request.data.get('lesson_id')

    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    # Check enrolled
    try:
        enrollment = Enrollment.objects.get(user=user, course=lesson.course)
    except Enrollment.DoesNotExist:
        return Response({"error": "Not enrolled in this course"}, status=403)

    from django.utils import timezone
    lp, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
    lp.completed = True
    lp.completed_at = timezone.now()
    lp.save()

    # Recalculate progress
    total_lessons = lesson.course.lessons.count()
    completed_lessons = LessonProgress.objects.filter(
        user=user,
        lesson__course=lesson.course,
        completed=True
    ).count()

    progress = int((completed_lessons / total_lessons) * 100) if total_lessons else 0
    enrollment.progress = progress

    if progress == 100 and not enrollment.completed:
        enrollment.completed = True
        enrollment.completed_at = timezone.now()

    enrollment.save()

    return Response({
        "message": "Lesson marked complete",
        "progress": progress,
        "course_completed": enrollment.completed
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_progress(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    completed_ids = LessonProgress.objects.filter(
        user=request.user,
        lesson__course=course,
        completed=True
    ).values_list('lesson_id', flat=True)

    return Response({"completed_lessons": list(completed_ids)})


# ─────────────────────────────────────────────
# QUIZ SYSTEM
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    # Must have completed the course
    enrollment = Enrollment.objects.filter(user=request.user, course=course, completed=True).first()
    if not enrollment:
        return Response({"error": "Complete the course first to access the quiz"}, status=403)

    try:
        quiz = Quiz.objects.prefetch_related('questions').get(course=course)
    except Quiz.DoesNotExist:
        return Response({"error": "No quiz available for this course"}, status=404)

    serializer = QuizSerializer(quiz)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)

    answers = request.data.get('answers', {})  # {question_id: answer}

    mcq_questions = quiz.questions.filter(question_type='mcq')
    total = mcq_questions.count()
    correct = 0

    for q in mcq_questions:
        user_ans = answers.get(str(q.id), '').upper()
        if user_ans == q.correct_answer.upper():
            correct += 1

    score = (correct / total * 100) if total else 0
    passed = score >= quiz.pass_percentage

    attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=round(score, 2),
        passed=passed,
        answers=json.dumps(answers)
    )

    # Issue certificate if passed and not already issued
    certificate = None
    if passed:
        cert, created = Certificate.objects.get_or_create(
            user=request.user,
            course=quiz.course,
            defaults={
                'certificate_id': f"LFC-{uuid.uuid4().hex[:10].upper()}"
            }
        )
        certificate = CertificateSerializer(cert).data

    return Response({
        "score": round(score, 2),
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
    serializer = CertificateSerializer(certs, many=True)
    return Response(serializer.data)


# ─────────────────────────────────────────────
# JOB SYSTEM
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request):
    user = request.user
    job_id = request.data.get('job_id')
    cover_letter = request.data.get('cover_letter', '')

    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)

    # Check certificate requirement
    if job.required_certificate:
        has_cert = Certificate.objects.filter(user=user, course=job.required_certificate).exists()
        if not has_cert:
            return Response({
                "error": f"You need the '{job.required_certificate.title}' certificate to apply for this job."
            }, status=403)

    app, created = Application.objects.get_or_create(
        user=user, job=job,
        defaults={'cover_letter': cover_letter}
    )
    if not created:
        return Response({"error": "Already applied"}, status=400)

    return Response({"message": "Applied successfully", "application_id": app.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    applications = Application.objects.filter(user=request.user).select_related('job', 'job__required_certificate')
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


# ─────────────────────────────────────────────
# ADMIN-STYLE SEED ENDPOINT (for demo)
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def seed_demo_data(request):
    """Seeds demo courses (JavaScript & Node.js) with lessons and quizzes."""
    from .models import CourseCategory

    cat, _ = CourseCategory.objects.get_or_create(name="Programming")

    # ── JavaScript Course ──
    js_course, _ = Course.objects.get_or_create(
        title="JavaScript Fundamentals",
        defaults={
            "description": "Master JavaScript from the ground up. Learn variables, functions, DOM, async/await, and modern ES6+ features used in real-world development.",
            "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/512px-Unofficial_JavaScript_logo_2.svg.png",
            "level": "beginner",
            "duration": "12 hours",
            "category": cat,
            "tags": json.dumps(["JavaScript", "ES6", "DOM", "Web"]),
            "is_featured": True,
        }
    )

    js_lessons = [
        ("Introduction to JavaScript", "https://www.youtube.com/embed/W6NZfCO5SIk", "What is JavaScript? History and how it runs in the browser.", 15),
        ("Variables & Data Types", "https://www.youtube.com/embed/9emXNzqCKyg", "var, let, const — when to use which. Primitive data types: string, number, boolean, null, undefined.", 20),
        ("Functions & Scope", "https://www.youtube.com/embed/FOD408a0EzU", "Declaring functions, arrow functions, hoisting, and lexical scope.", 25),
        ("Arrays & Objects", "https://www.youtube.com/embed/oigfaZ5ApsM", "Working with arrays and objects, destructuring, spread/rest operators.", 30),
        ("DOM Manipulation", "https://www.youtube.com/embed/5fb2aPlgoys", "Selecting elements, changing content and styles, handling events.", 25),
        ("Async JavaScript", "https://www.youtube.com/embed/PoRJizFvM7s", "Callbacks, Promises, async/await, and the event loop explained.", 35),
        ("ES6+ Modern Features", "https://www.youtube.com/embed/NCwa_xi0Uuc", "Template literals, optional chaining, nullish coalescing, modules.", 20),
        ("Mini Project: Todo App", "https://www.youtube.com/embed/Ttf3CEsEwMQ", "Build a complete Todo app using vanilla JavaScript and DOM manipulation.", 40),
    ]

    for i, (title, url, content, mins) in enumerate(js_lessons):
        Lesson.objects.get_or_create(
            course=js_course, order=i,
            defaults={"title": title, "youtube_url": url, "content": content, "duration_minutes": mins}
        )

    # Quiz for JS
    js_quiz, _ = Quiz.objects.get_or_create(
        course=js_course,
        defaults={"title": "JavaScript Mastery Exam", "time_limit_minutes": 60, "pass_percentage": 70}
    )

    js_questions = [
        ("Which keyword declares a block-scoped variable?", "var", "let", "function", "class", "B"),
        ("What does typeof null return?", '"null"', '"object"', '"undefined"', '"boolean"', "B"),
        ("Which method adds an element to the end of an array?", "push()", "pop()", "shift()", "unshift()", "A"),
        ("What is the output of: console.log(typeof [])?", '"array"', '"list"', '"object"', '"undefined"', "C"),
        ("Which symbol is used for template literals?", "single quotes", "double quotes", "backticks", "parentheses", "C"),
        ("What does === check?", "Only value", "Only type", "Value and type", "Neither", "C"),
        ("async/await is built on top of:", "callbacks", "generators", "Promises", "event emitters", "C"),
        ("Which method creates a new array with all elements that pass a test?", "map()", "filter()", "reduce()", "forEach()", "B"),
        ("What is closure in JavaScript?", "A loop", "A function with access to its outer scope", "A type of object", "A module system", "B"),
        ("Which event fires when the DOM is fully loaded?", "onload", "DOMContentLoaded", "ready", "init", "B"),
    ]

    for i, (text, a, b, c, d, correct) in enumerate(js_questions):
        Question.objects.get_or_create(
            quiz=js_quiz, order=i,
            defaults={
                "text": text, "question_type": "mcq",
                "option_a": a, "option_b": b, "option_c": c, "option_d": d,
                "correct_answer": correct
            }
        )

    # ── Node.js Course ──
    node_course, _ = Course.objects.get_or_create(
        title="Node.js & Express Backend",
        defaults={
            "description": "Build scalable server-side applications with Node.js and Express. Learn REST APIs, middleware, authentication, and database integration.",
            "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/512px-Node.js_logo.svg.png",
            "level": "intermediate",
            "duration": "15 hours",
            "category": cat,
            "tags": json.dumps(["Node.js", "Express", "REST API", "Backend"]),
            "is_featured": True,
        }
    )

    node_lessons = [
        ("What is Node.js?", "https://www.youtube.com/embed/TlB_eWDSMt4", "Node.js runtime, event loop, and why it's different from browser JS.", 15),
        ("Node.js Modules & NPM", "https://www.youtube.com/embed/xHLd36QoS4k", "CommonJS modules, require(), npm init, package.json.", 20),
        ("File System & Events", "https://www.youtube.com/embed/U57kU311-nE", "Reading/writing files, EventEmitter, streams.", 25),
        ("Introduction to Express", "https://www.youtube.com/embed/L72fhGm1tfE", "Setting up Express, routing, handling requests and responses.", 25),
        ("Middleware in Express", "https://www.youtube.com/embed/lY6icfhap2o", "Built-in, third-party, and custom middleware. Error handling.", 20),
        ("REST API Design", "https://www.youtube.com/embed/0oXYLzuucwE", "HTTP methods, status codes, RESTful principles, Postman testing.", 30),
        ("JWT Authentication", "https://www.youtube.com/embed/7Q17ubqLfaM", "Implementing login/register with JWT tokens.", 35),
        ("PostgreSQL with Sequelize", "https://www.youtube.com/embed/Crj9yjm99qU", "Connecting to PostgreSQL, models, migrations, and queries.", 40),
        ("Error Handling & Validation", "https://www.youtube.com/embed/w1V2SdzdQBs", "Input validation, try/catch, centralized error handling.", 20),
        ("Mini Project: REST API", "https://www.youtube.com/embed/f2EqECiTBL8", "Build a complete REST API with auth and database from scratch.", 45),
    ]

    for i, (title, url, content, mins) in enumerate(node_lessons):
        Lesson.objects.get_or_create(
            course=node_course, order=i,
            defaults={"title": title, "youtube_url": url, "content": content, "duration_minutes": mins}
        )

    node_quiz, _ = Quiz.objects.get_or_create(
        course=node_course,
        defaults={"title": "Node.js Backend Expert Exam", "time_limit_minutes": 60, "pass_percentage": 70}
    )

    node_questions = [
        ("Node.js is built on which JavaScript engine?", "SpiderMonkey", "V8", "Chakra", "JavaScriptCore", "B"),
        ("Which module handles file operations in Node.js?", "http", "path", "fs", "os", "C"),
        ("What is npm?", "Node Package Manager", "Node Process Manager", "New Project Module", "None", "A"),
        ("Express.js is a:", "database ORM", "web framework", "testing library", "build tool", "B"),
        ("Which HTTP method is used to update a resource?", "GET", "POST", "PUT", "DELETE", "C"),
        ("What does res.json() do?", "Parses JSON", "Sends JSON response", "Reads JSON file", "Validates JSON", "B"),
        ("JWT stands for:", "JavaScript Web Token", "JSON Web Token", "Java Web Transfer", "JSON Web Transfer", "B"),
        ("Which middleware parses incoming JSON requests?", "express.urlencoded()", "express.json()", "express.static()", "express.raw()", "B"),
        ("Status code 404 means:", "OK", "Server Error", "Not Found", "Unauthorized", "C"),
        ("What is middleware in Express?", "A database", "A function that runs between request and response", "A template engine", "A router", "B"),
    ]

    for i, (text, a, b, c, d, correct) in enumerate(node_questions):
        Question.objects.get_or_create(
            quiz=node_quiz, order=i,
            defaults={
                "text": text, "question_type": "mcq",
                "option_a": a, "option_b": b, "option_c": c, "option_d": d,
                "correct_answer": correct
            }
        )

    # Seed Jobs
    Job.objects.get_or_create(
        title="Junior JavaScript Developer",
        defaults={
            "company": "TechSolutions Nepal",
            "company_logo": "https://ui-avatars.com/api/?name=TS&background=F7DF1E&color=000",
            "location": "Kathmandu, Nepal",
            "description": "We are looking for a passionate JavaScript developer to join our team. You will work on building dynamic web applications.",
            "requirements": "Strong knowledge of JavaScript ES6+, DOM manipulation, and React basics.",
            "job_type": "full-time",
            "salary_range": "NPR 50,000 - 80,000",
            "required_certificate": js_course,
            "is_active": True,
        }
    )

    Job.objects.get_or_create(
        title="Backend Engineer (Node.js)",
        defaults={
            "company": "Leapfrog Technology",
            "company_logo": "https://ui-avatars.com/api/?name=LF&background=68A063&color=fff",
            "location": "Lalitpur, Nepal",
            "description": "Build and maintain RESTful APIs and microservices. Work with PostgreSQL and cloud infrastructure.",
            "requirements": "Proficiency in Node.js, Express, REST API design, PostgreSQL.",
            "job_type": "full-time",
            "salary_range": "NPR 80,000 - 120,000",
            "required_certificate": node_course,
            "is_active": True,
        }
    )

    Job.objects.get_or_create(
        title="Full Stack Developer Intern",
        defaults={
            "company": "Fusemachines",
            "company_logo": "https://ui-avatars.com/api/?name=FM&background=6366F1&color=fff",
            "location": "Remote, Nepal",
            "description": "Internship opportunity to work on real-world web projects. Great learning environment.",
            "requirements": "Basic knowledge of JavaScript and Node.js.",
            "job_type": "internship",
            "salary_range": "NPR 20,000 - 30,000",
            "required_certificate": None,
            "is_active": True,
        }
    )

    return Response({"message": "Demo data seeded successfully "})