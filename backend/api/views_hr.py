"""
views_hr.py
All views accessible only by HR role.
HR can manage jobs, view applicants, move them through the hiring funnel,
and access the talent pool (students with certificates).
"""

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Job, Application, Certificate, Enrollment, User as UserModel
from .serializers import (
    JobSerializer, ApplicationHRSerializer, UserSerializer, CertificateSerializer
)
from .permissions import IsHR

User = get_user_model()


# ─────────────────────────────────────────────
# HR DASHBOARD
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def hr_dashboard(request):
    """HR-specific stats: jobs, pipeline counts, talent pool size."""
    my_jobs = Job.objects.filter(created_by=request.user)

    return Response({
        "my_jobs_total": my_jobs.count(),
        "my_jobs_active": my_jobs.filter(is_active=True).count(),
        "total_applications": Application.objects.count(),
        "pipeline": {
            "applied": Application.objects.filter(status='applied').count(),
            "interview": Application.objects.filter(status='interview').count(),
            "hired": Application.objects.filter(status='hired').count(),
            "rejected": Application.objects.filter(status='rejected').count(),
        },
        "talent_pool_size": Certificate.objects.values('user').distinct().count(),
    })


# ─────────────────────────────────────────────
# JOB MANAGEMENT
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def hr_list_jobs(request):
    """List all jobs. Supports ?mine=true to show only HR's own jobs."""
    jobs = Job.objects.all().order_by('-created_at')
    if request.query_params.get('mine') == 'true':
        jobs = jobs.filter(created_by=request.user)
    return Response(JobSerializer(jobs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHR])
def create_job(request):
    serializer = JobSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsHR])
def update_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)

    # HR can only edit jobs they created
    if job.created_by != request.user:
        return Response({"error": "You can only edit jobs you created"}, status=403)

    serializer = JobSerializer(job, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHR])
def delete_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)

    if job.created_by != request.user:
        return Response({"error": "You can only delete jobs you created"}, status=403)

    job.is_active = False  # Soft delete
    job.save(update_fields=['is_active'])
    return Response({"message": "Job deactivated"})


# ─────────────────────────────────────────────
# APPLICATION MANAGEMENT (Hiring Funnel)
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_all_applications(request):
    """
    List all applications with full applicant + job detail.
    Supports filters: ?job_id=&status=&search=
    """
    apps = (
        Application.objects
        .select_related('user', 'job', 'reviewed_by')
        .order_by('-applied_at')
    )

    job_id = request.query_params.get('job_id')
    status = request.query_params.get('status')
    search = request.query_params.get('search')  # search by applicant name/email

    if job_id:
        apps = apps.filter(job_id=job_id)
    if status:
        apps = apps.filter(status=status)
    if search:
        apps = apps.filter(user__username__icontains=search) | apps.filter(user__first_name__icontains=search)

    return Response(ApplicationHRSerializer(apps, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_application_detail(request, app_id):
    try:
        app = Application.objects.select_related('user', 'job', 'reviewed_by').get(id=app_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)
    return Response(ApplicationHRSerializer(app).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsHR])
def update_application_status(request):
    """
    Move an application through the hiring funnel.
    Body: { application_id, status, hr_notes (optional) }
    """
    app_id = request.data.get('application_id')
    new_status = request.data.get('status')
    hr_notes = request.data.get('hr_notes', '')

    valid_statuses = [s for s, _ in Application.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({"error": f"Invalid status. Choose from: {valid_statuses}"}, status=400)

    try:
        app = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)

    app.status = new_status
    app.reviewed_by = request.user
    if hr_notes:
        app.hr_notes = hr_notes
    app.save(update_fields=['status', 'reviewed_by', 'hr_notes', 'updated_at'])

    return Response({
        "message": f"Application status updated to '{new_status}'",
        "application": ApplicationHRSerializer(app).data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsHR])
def bulk_update_application_status(request):
    """
    Update multiple applications at once.
    Body: { application_ids: [1,2,3], status: 'rejected' }
    """
    app_ids = request.data.get('application_ids', [])
    new_status = request.data.get('status')

    valid_statuses = [s for s, _ in Application.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({"error": f"Invalid status. Choose from: {valid_statuses}"}, status=400)

    if not app_ids:
        return Response({"error": "No application IDs provided"}, status=400)

    updated = Application.objects.filter(id__in=app_ids).update(
        status=new_status, reviewed_by=request.user
    )
    return Response({"message": f"{updated} applications updated to '{new_status}'"})


# ─────────────────────────────────────────────
# TALENT POOL
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_talent_pool(request):
    """
    View all students who have earned at least one certificate.
    Supports filters: ?course_id= to filter by specific certificate.
    """
    course_id = request.query_params.get('course_id')

    if course_id:
        cert_user_ids = Certificate.objects.filter(course_id=course_id).values_list('user_id', flat=True)
    else:
        cert_user_ids = Certificate.objects.values_list('user_id', flat=True).distinct()

    candidates = User.objects.filter(id__in=cert_user_ids, role='customer')

    result = []
    for user in candidates:
        certs = Certificate.objects.filter(user=user).select_related('course')
        enrollments = Enrollment.objects.filter(user=user, completed=True).count()
        result.append({
            "user": UserSerializer(user).data,
            "certificates": CertificateSerializer(certs, many=True).data,
            "completed_courses": enrollments,
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_candidate_profile(request, user_id):
    """Full profile of a specific candidate for HR review."""
    try:
        candidate = User.objects.get(id=user_id, role='customer')
    except User.DoesNotExist:
        return Response({"error": "Candidate not found"}, status=404)

    certs = Certificate.objects.filter(user=candidate).select_related('course')
    enrollments = Enrollment.objects.filter(user=candidate).select_related('course')
    applications = Application.objects.filter(user=candidate).select_related('job')

    return Response({
        "profile": UserSerializer(candidate).data,
        "certificates": CertificateSerializer(certs, many=True).data,
        "courses_enrolled": enrollments.count(),
        "courses_completed": enrollments.filter(completed=True).count(),
        "total_applications": applications.count(),
        "application_history": [
            {"job": a.job.title, "company": a.job.company, "status": a.status}
            for a in applications
        ],
    })