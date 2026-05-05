

from django.urls import path
from .views import (
    test, get_courses, get_course_detail, get_jobs, get_job_detail,
    get_profile, register, apply_job, enroll_course, my_courses,
    my_applications, update_profile, complete_lesson, get_lesson_progress,
    get_quiz, submit_quiz, my_certificates, get_dashboard_stats, seed_demo_data
)

urlpatterns = [
    path('test/', test),

    # Courses
    path('courses/', get_courses),
    path('courses/<int:pk>/', get_course_detail),
    path('enroll/', enroll_course),
    path('my-courses/', my_courses),
    path('complete-lesson/', complete_lesson),
    path('lesson-progress/<int:course_id>/', get_lesson_progress),

    # Quiz & Certificates
    path('quiz/<int:course_id>/', get_quiz),
    path('quiz/<int:quiz_id>/submit/', submit_quiz),
    path('my-certificates/', my_certificates),

    # Jobs
    path('jobs/', get_jobs),
    path('jobs/<int:pk>/', get_job_detail),
    path('apply/', apply_job),
    path('my-applications/', my_applications),

    # User
    path('profile/', get_profile),
    path('register/', register),
    path('update-profile/', update_profile),

    # Dashboard
    path('dashboard-stats/', get_dashboard_stats),

    # Demo seed
    path('seed/', seed_demo_data),
]