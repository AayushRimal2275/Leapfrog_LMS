import json
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


# ─────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('hr', 'HR'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    # Profile fields
    bio = models.TextField(blank=True, default="")
    avatar = models.URLField(blank=True, default="")
    skills = models.TextField(blank=True, default="[]")  # JSON list
    headline = models.CharField(max_length=255, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    github = models.URLField(blank=True, default="")
    linkedin = models.URLField(blank=True, default="")
    website = models.URLField(blank=True, default="")

    # Gamification
    streak = models.IntegerField(default=0)
    last_active = models.DateField(null=True, blank=True)

    def get_skills_list(self):
        try:
            return json.loads(self.skills)
        except Exception:
            return []

    def set_skills_list(self, lst):
        self.skills = json.dumps(lst)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ─────────────────────────────────────────────
# COURSE & LESSONS
# ─────────────────────────────────────────────

class CourseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.URLField(blank=True, default="")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    duration = models.CharField(max_length=100, blank=True, default="")
    category = models.ForeignKey(CourseCategory, null=True, blank=True, on_delete=models.SET_NULL)
    tags = models.TextField(blank=True, default="[]")  # JSON list
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def get_tags(self):
        try:
            return json.loads(self.tags)
        except Exception:
            return []


class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    youtube_url = models.URLField(blank=True, default="")
    content = models.TextField(blank=True, default="")
    duration_minutes = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# ─────────────────────────────────────────────
# ENROLLMENT & PROGRESS
# ─────────────────────────────────────────────

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)  # 0-100
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} → {self.course.title}"


class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'lesson')


# ─────────────────────────────────────────────
# QUIZ & CERTIFICATES
# ─────────────────────────────────────────────

class Quiz(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    time_limit_minutes = models.IntegerField(default=60)
    pass_percentage = models.IntegerField(default=70)

    def __str__(self):
        return f"Quiz: {self.course.title}"


class Question(models.Model):
    TYPE_CHOICES = [
        ('mcq', 'Multiple Choice'),
        ('written', 'Written'),
    ]
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='mcq')
    option_a = models.CharField(max_length=500, blank=True)
    option_b = models.CharField(max_length=500, blank=True)
    option_c = models.CharField(max_length=500, blank=True)
    option_d = models.CharField(max_length=500, blank=True)
    correct_answer = models.CharField(max_length=1, blank=True)  # A/B/C/D
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)
    answers = models.TextField(default="{}")  # JSON {question_id: answer}

    def __str__(self):
        return f"{self.user.username} - {self.quiz.course.title} - {self.score}%"


class Certificate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.CharField(max_length=100, unique=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"Cert: {self.user.username} - {self.course.title}"


# ─────────────────────────────────────────────
# JOBS & APPLICATIONS
# ─────────────────────────────────────────────

class Job(models.Model):
    TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('remote', 'Remote'),
        ('internship', 'Internship'),
    ]
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    company_logo = models.URLField(blank=True, default="")
    location = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, default="")
    job_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full-time')
    salary_range = models.CharField(max_length=100, blank=True, default="")
    required_certificate = models.ForeignKey(Course, null=True, blank=True, on_delete=models.SET_NULL)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_jobs')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    cover_letter = models.TextField(blank=True, default="")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_applications'
    )
    hr_notes = models.TextField(blank=True, default="")  # Internal HR notes

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.username} → {self.job.title} [{self.status}]"