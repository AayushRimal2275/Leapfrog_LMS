# from django.contrib import admin

# # Register your models here.
# from django.contrib import admin
# from .models import User, Course, Enrollment, Job, Application

# admin.site.register(User)
# admin.site.register(Course)
# admin.site.register(Enrollment)
# admin.site.register(Job)
# admin.site.register(Application)



from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Course, CourseCategory, Lesson, Enrollment, LessonProgress,
    Quiz, Question, QuizAttempt, Certificate, Job, Application
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('bio', 'avatar', 'skills', 'headline', 'location', 'github', 'linkedin', 'website', 'streak')}),
    )
    list_display = ['username', 'email', 'first_name', 'last_name', 'streak']


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'is_featured', 'created_at']
    inlines = [LessonInline]
    list_filter = ['level', 'is_featured']
    search_fields = ['title']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['course', 'pass_percentage', 'time_limit_minutes']
    inlines = [QuestionInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress', 'completed', 'enrolled_at']
    list_filter = ['completed']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'certificate_id', 'issued_at']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'is_active', 'created_at']
    list_filter = ['job_type', 'is_active']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'status', 'applied_at']
    list_filter = ['status']


admin.site.register(CourseCategory)
admin.site.register(Lesson)
admin.site.register(QuizAttempt)
admin.site.register(LessonProgress)