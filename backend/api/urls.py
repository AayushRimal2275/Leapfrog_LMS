from django.urls import path

# ── Customer / Public views ──
from .views_customer import (
    health_check,
    # Public
    get_courses, get_course_detail, get_jobs, get_job_detail,
    # Auth
    register,
    # Profile
    get_profile, update_profile,
    # Dashboard
    get_dashboard_stats,
    # Courses
    enroll_course, my_courses, complete_lesson, get_lesson_progress,
    # Quiz
    get_quiz, submit_quiz,
    # Certificates
    my_certificates,
    # Jobs
    apply_job, my_applications,
)

# ── Admin views ──
from .views_admin import (
    admin_dashboard,
    # Users
    get_all_users, get_user_detail, update_user_role, toggle_user_active, delete_user,
    # Courses
    create_course, update_course, delete_course,
    # Lessons
    create_lesson, update_lesson, delete_lesson,
    # Quiz
    create_quiz, add_question,
    # Categories
    list_categories, create_category, delete_category,
)

# ── HR views ──
from .views_hr import (
    hr_dashboard,
    # Jobs
    hr_list_jobs, create_job, update_job, delete_job,
    # Applications
    get_all_applications, get_application_detail,
    update_application_status, bulk_update_application_status,
    # Talent Pool
    get_talent_pool, get_candidate_profile,
)


urlpatterns = [

    # ─────────────────────────────────────────
    # HEALTH CHECK
    # ─────────────────────────────────────────
    path('', health_check),

    # ─────────────────────────────────────────
    # PUBLIC  (no auth required)
    # ─────────────────────────────────────────
    path('courses/', get_courses),
    path('courses/<int:pk>/', get_course_detail),
    path('jobs/', get_jobs),
    path('jobs/<int:pk>/', get_job_detail),

    # ─────────────────────────────────────────
    # AUTH
    # ─────────────────────────────────────────
    path('register/', register),

    # ─────────────────────────────────────────
    # CUSTOMER — Profile & Dashboard
    # ─────────────────────────────────────────
    path('profile/', get_profile),
    path('profile/update/', update_profile),
    path('dashboard/', get_dashboard_stats),

    # ─────────────────────────────────────────
    # CUSTOMER — Course System
    # ─────────────────────────────────────────
    path('enroll/', enroll_course),
    path('my-courses/', my_courses),
    path('complete-lesson/', complete_lesson),
    path('lesson-progress/<int:course_id>/', get_lesson_progress),

    # ─────────────────────────────────────────
    # CUSTOMER — Quiz & Certificates
    # ─────────────────────────────────────────
    path('quiz/<int:course_id>/', get_quiz),
    path('quiz/<int:quiz_id>/submit/', submit_quiz),
    path('my-certificates/', my_certificates),

    # ─────────────────────────────────────────
    # CUSTOMER — Jobs
    # ─────────────────────────────────────────
    path('apply/', apply_job),
    path('my-applications/', my_applications),

    # ─────────────────────────────────────────
    # ADMIN — Dashboard & Analytics
    # ─────────────────────────────────────────
    path('admin/dashboard/', admin_dashboard),

    # ADMIN — User Management
    path('admin/users/', get_all_users),
    path('admin/users/<int:user_id>/', get_user_detail),
    path('admin/users/<int:user_id>/delete/', delete_user),
    path('admin/users/update-role/', update_user_role),
    path('admin/users/<int:user_id>/toggle-active/', toggle_user_active),

    # ADMIN — Course Management
    path('admin/courses/create/', create_course),
    path('admin/courses/<int:course_id>/update/', update_course),
    path('admin/courses/<int:course_id>/delete/', delete_course),

    # ADMIN — Lesson Management
    path('admin/courses/<int:course_id>/lessons/create/', create_lesson),
    path('admin/lessons/<int:lesson_id>/update/', update_lesson),
    path('admin/lessons/<int:lesson_id>/delete/', delete_lesson),

    # ADMIN — Quiz Management
    path('admin/courses/<int:course_id>/quiz/create/', create_quiz),
    path('admin/quiz/<int:quiz_id>/questions/add/', add_question),

    # ADMIN — Categories
    path('admin/categories/', list_categories),
    path('admin/categories/create/', create_category),
    path('admin/categories/<int:category_id>/delete/', delete_category),

    # ─────────────────────────────────────────
    # HR — Dashboard
    # ─────────────────────────────────────────
    path('hr/dashboard/', hr_dashboard),

    # HR — Job Management
    path('hr/jobs/', hr_list_jobs),
    path('hr/jobs/create/', create_job),
    path('hr/jobs/<int:job_id>/update/', update_job),
    path('hr/jobs/<int:job_id>/delete/', delete_job),

    # HR — Application / Hiring Funnel
    path('hr/applications/', get_all_applications),
    path('hr/applications/<int:app_id>/', get_application_detail),
    path('hr/applications/update-status/', update_application_status),
    path('hr/applications/bulk-update/', bulk_update_application_status),

    # HR — Talent Pool
    path('hr/talent-pool/', get_talent_pool),
    path('hr/talent-pool/<int:user_id>/', get_candidate_profile),
]