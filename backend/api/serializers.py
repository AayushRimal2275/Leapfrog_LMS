
        


import json
from rest_framework import serializers
from .models import (
    Course, Job, User, Enrollment, Lesson, LessonProgress,
    Quiz, Question, QuizAttempt, Certificate, Application, CourseCategory
)


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'youtube_url', 'content', 'duration_minutes']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'time_limit_minutes', 'pass_percentage', 'questions']


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'level',
            'duration', 'tags', 'lesson_count', 'lessons',
            'is_featured', 'created_at'
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_tags(self, obj):
        return obj.get_tags()


class CourseListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'level', 'duration', 'tags', 'lesson_count', 'is_featured']

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_tags(self, obj):
        return obj.get_tags()


class JobSerializer(serializers.ModelSerializer):
    required_certificate_title = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'company_logo', 'location',
            'description', 'requirements', 'job_type', 'salary_range',
            'required_certificate', 'required_certificate_title',
            'created_at', 'is_active'
        ]

    def get_required_certificate_title(self, obj):
        if obj.required_certificate:
            return obj.required_certificate.title
        return None


class UserSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'bio', 'avatar',
            'skills', 'headline', 'location', 'github',
            'linkedin', 'website', 'streak', 'first_name', 'last_name'
        ]

    def get_skills(self, obj):
        return obj.get_skills_list()


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


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'status', 'applied_at', 'cover_letter']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'score', 'passed', 'attempted_at']