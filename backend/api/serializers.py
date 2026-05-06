import json
from rest_framework import serializers
from .models import (
    User, CourseCategory, Course, Lesson, LessonProgress,
    Enrollment, Quiz, Question, QuizAttempt, Certificate,
    Job, Application
)


# ─────────────────────────────────────────────
# SHARED / BASE
# ─────────────────────────────────────────────

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ['id', 'name']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'youtube_url', 'content', 'duration_minutes']


class QuestionSerializer(serializers.ModelSerializer):
    """Questions shown to students — no correct_answer exposed."""
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class QuestionAdminSerializer(serializers.ModelSerializer):
    """Full question data for admin — includes correct_answer."""
    class Meta:
        model = Question
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'time_limit_minutes', 'pass_percentage', 'questions']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'score', 'passed', 'attempted_at']


# ─────────────────────────────────────────────
# COURSE SERIALIZERS
# ─────────────────────────────────────────────

class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight — used in lists and enrollments."""
    lesson_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    category = CourseCategorySerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'level',
            'duration', 'tags', 'lesson_count', 'category', 'is_featured'
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_tags(self, obj):
        return obj.get_tags()


class CourseSerializer(serializers.ModelSerializer):
    """Full detail — used in course detail page."""
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    category = CourseCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseCategory.objects.all(), source='category', write_only=True, required=False
    )

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'level', 'duration',
            'tags', 'lesson_count', 'lessons', 'category', 'category_id',
            'is_featured', 'is_active', 'created_at', 'updated_at'
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_tags(self, obj):
        return obj.get_tags()


# ─────────────────────────────────────────────
# USER SERIALIZERS
# ─────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Public user profile — used by customer, returned in lists."""
    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'skills', 'headline', 'location',
            'github', 'linkedin', 'website', 'streak', 'role'
        ]

    def get_skills(self, obj):
        return obj.get_skills_list()


class UserAdminSerializer(serializers.ModelSerializer):
    """Extended user data for admin — includes date_joined, is_active."""
    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'skills', 'headline', 'location',
            'github', 'linkedin', 'website', 'streak', 'role',
            'is_active', 'date_joined', 'last_login'
        ]

    def get_skills(self, obj):
        return obj.get_skills_list()


# ─────────────────────────────────────────────
# ENROLLMENT & CERTIFICATE
# ─────────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'progress', 'enrolled_at', 'completed', 'completed_at']


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'course_id', 'course_title', 'issued_at', 'certificate_id']


# ─────────────────────────────────────────────
# JOB & APPLICATION
# ─────────────────────────────────────────────

class JobSerializer(serializers.ModelSerializer):
    required_certificate_title = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'company_logo', 'location',
            'description', 'requirements', 'job_type', 'salary_range',
            'required_certificate', 'required_certificate_title',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_required_certificate_title(self, obj):
        return obj.required_certificate.title if obj.required_certificate else None


class ApplicationSerializer(serializers.ModelSerializer):
    """Customer view — shows their own application + job info."""
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'status', 'cover_letter', 'applied_at', 'updated_at']


class ApplicationHRSerializer(serializers.ModelSerializer):
    """HR view — includes applicant info + HR-only fields."""
    job = JobSerializer(read_only=True)
    applicant = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'applicant', 'status', 'cover_letter',
            'applied_at', 'updated_at', 'reviewed_by', 'hr_notes'
        ]