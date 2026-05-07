from django.urls import path

# Customer / Public
from .views_customer import (
    health_check, get_courses, get_course_detail, get_jobs, get_job_detail,
    register, get_profile, update_profile, get_dashboard_stats,
    enroll_course, my_courses, complete_lesson, get_lesson_progress,
    get_quiz, submit_quiz, my_certificates, apply_job, my_applications,
)

# Admin
from .views_admin import (
    admin_dashboard,
    get_all_users, get_user_detail, update_user_role, toggle_user_active, delete_user,
    create_course, update_course, delete_course,
    create_lesson, update_lesson, delete_lesson,
    get_quiz_admin, create_quiz, update_quiz, delete_quiz,
    add_question, update_question, delete_question,
    list_categories, create_category, delete_category,
)

# HR
from .views_hr import (
    hr_dashboard,
    hr_list_jobs, create_job, update_job, delete_job,
    get_all_applications, get_application_detail,
    update_application_status, bulk_update_application_status,
    get_talent_pool, get_candidate_profile,
)

# Events
from .views_events import (
    list_events, event_detail, register_event, cancel_event_registration, my_events,
    admin_list_events, create_event, update_event, delete_event,
    event_registrations, update_registration_status,
)

# Notifications, Password Reset, Projects, Extra Certs
from .views_notifications import (
    get_notifications, mark_all_read, mark_one_read,
    forgot_password, reset_password,
    list_extra_certificates, add_extra_certificate, delete_extra_certificate,
    list_projects, add_project, update_project, delete_project,
)

# Social Auth
from .views_social_auth import google_login

# JWT
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [

    # HEALTH & JWT
    path('', health_check),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

    # PUBLIC
    path('courses/', get_courses),
    path('courses/<int:pk>/', get_course_detail),
    path('jobs/', get_jobs),
    path('jobs/<int:pk>/', get_job_detail),
    path('events/', list_events),
    path('events/<int:event_id>/', event_detail),

    # AUTH
    path('register/', register),
    path('auth/forgot-password/', forgot_password),
    path('auth/reset-password/', reset_password),
    path('auth/google/', google_login),

    # CUSTOMER — Profile & Dashboard
    path('profile/', get_profile),
    path('profile/update/', update_profile),
    path('dashboard/', get_dashboard_stats),

    # CUSTOMER — Courses
    path('enroll/', enroll_course),
    path('my-courses/', my_courses),
    path('complete-lesson/', complete_lesson),
    path('lesson-progress/<int:course_id>/', get_lesson_progress),

    # CUSTOMER — Quiz & Certificates
    path('quiz/<int:course_id>/', get_quiz),
    path('quiz/<int:quiz_id>/submit/', submit_quiz),
    path('my-certificates/', my_certificates),

    # CUSTOMER — Jobs & Applications
    path('apply/', apply_job),
    path('my-applications/', my_applications),

    # CUSTOMER — Events
    path('events/<int:event_id>/register/', register_event),
    path('events/<int:event_id>/cancel/', cancel_event_registration),
    path('my-events/', my_events),

    # CUSTOMER — Notifications
    path('notifications/', get_notifications),
    path('notifications/read-all/', mark_all_read),
    path('notifications/<int:notif_id>/read/', mark_one_read),

    # CUSTOMER — Extra Certificates
    path('extra-certificates/', list_extra_certificates),
    path('extra-certificates/add/', add_extra_certificate),
    path('extra-certificates/<int:cert_id>/delete/', delete_extra_certificate),

    # CUSTOMER — Projects
    path('projects/', list_projects),
    path('projects/add/', add_project),
    path('projects/<int:project_id>/update/', update_project),
    path('projects/<int:project_id>/delete/', delete_project),

    # ADMIN — Dashboard & Users
    path('admin/dashboard/', admin_dashboard),
    path('admin/users/', get_all_users),
    path('admin/users/<int:user_id>/', get_user_detail),
    path('admin/users/<int:user_id>/delete/', delete_user),
    path('admin/users/update-role/', update_user_role),
    path('admin/users/<int:user_id>/toggle-active/', toggle_user_active),

    # ADMIN — Courses & Lessons
    path('admin/courses/create/', create_course),
    path('admin/courses/<int:course_id>/update/', update_course),
    path('admin/courses/<int:course_id>/delete/', delete_course),
    path('admin/courses/<int:course_id>/lessons/create/', create_lesson),
    path('admin/lessons/<int:lesson_id>/update/', update_lesson),
    path('admin/lessons/<int:lesson_id>/delete/', delete_lesson),

    # ADMIN — Quiz & Questions (NEW)
    path('admin/courses/<int:course_id>/quiz/', get_quiz_admin),
    path('admin/courses/<int:course_id>/quiz/create/', create_quiz),
    path('admin/quiz/<int:quiz_id>/update/', update_quiz),
    path('admin/quiz/<int:quiz_id>/delete/', delete_quiz),
    path('admin/quiz/<int:quiz_id>/questions/add/', add_question),
    path('admin/questions/<int:question_id>/update/', update_question),
    path('admin/questions/<int:question_id>/delete/', delete_question),

    # ADMIN — Categories
    path('admin/categories/', list_categories),
    path('admin/categories/create/', create_category),
    path('admin/categories/<int:category_id>/delete/', delete_category),

    # ADMIN — Events
    path('admin/events/', admin_list_events),
    path('admin/events/create/', create_event),
    path('admin/events/<int:event_id>/update/', update_event),
    path('admin/events/<int:event_id>/delete/', delete_event),
    path('admin/events/<int:event_id>/registrations/', event_registrations),
    path('admin/events/registrations/<int:reg_id>/update/', update_registration_status),

    # HR
    path('hr/dashboard/', hr_dashboard),
    path('hr/jobs/', hr_list_jobs),
    path('hr/jobs/create/', create_job),
    path('hr/jobs/<int:job_id>/update/', update_job),
    path('hr/jobs/<int:job_id>/delete/', delete_job),
    path('hr/applications/', get_all_applications),
    path('hr/applications/<int:app_id>/', get_application_detail),
    path('hr/applications/update-status/', update_application_status),
    path('hr/applications/bulk-update/', bulk_update_application_status),
    path('hr/talent-pool/', get_talent_pool),
    path('hr/talent-pool/<int:user_id>/', get_candidate_profile),
]