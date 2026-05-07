"""
views_hr.py
All views accessible by the HR role.
"""
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings as django_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    Job, Application, Certificate, Enrollment,
    Notification, Event, EventRegistration,
    ExtraCertificate, UserProject,
)
from .serializers import JobSerializer, CertificateSerializer
from .permissions import IsHR

User = get_user_model()

STATUS_MESSAGES = {
    'interview': ('Interview Invite 🗓️', "Congratulations! You've been selected for an interview for {job} at {company}. We'll be in touch with details soon."),
    'hired':     ('You\'re Hired! 🎉',    "Fantastic news! You've been hired for {job} at {company}. Welcome to the team!"),
    'rejected':  ('Application Update',   "Thank you for applying for {job} at {company}. After careful review, we've decided to move forward with other candidates. We encourage you to apply for future openings."),
    'applied':   ('Application Received', "Your application for {job} at {company} has been received and is under review."),
}


def _notify_applicant(application, new_status, hr_notes=""):
    """Create in-app notification + send email when HR updates status."""
    job   = application.job
    user  = application.user
    title_tpl, msg_tpl = STATUS_MESSAGES.get(new_status, ('Application Update', 'Your application status has changed to {status}.'))

    title   = title_tpl
    message = msg_tpl.format(job=job.title, company=job.company, status=new_status)
    if hr_notes:
        message += f"\n\nHR Note: {hr_notes}"

    # In-app notification
    Notification.objects.create(
        user=user,
        type=new_status if new_status in ('hired', 'interview', 'rejected') else 'status',
        title=title,
        message=message,
        link='/my-applications',
    )

    # Email notification
    if user.email:
        try:
            send_mail(
                subject=f"[Leapfrog Connect] {title}",
                message=f"Hi {user.first_name or user.username},\n\n{message}\n\n— Leapfrog Connect HR Team",
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass


# ─────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def hr_dashboard(request):
    my_jobs   = Job.objects.filter(created_by=request.user)
    all_apps  = Application.objects.filter(job__in=my_jobs)

    pipeline = {
        s: all_apps.filter(status=s).count()
        for s in ['applied', 'interview', 'hired', 'rejected']
    }

    return Response({
        'my_jobs_total':      my_jobs.count(),
        'my_jobs_active':     my_jobs.filter(is_active=True).count(),
        'total_applications': all_apps.count(),
        'talent_pool_size':   Certificate.objects.values('user').distinct().count(),
        'pipeline':           pipeline,
    })


# ─────────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def hr_list_jobs(request):
    jobs = Job.objects.filter(created_by=request.user).order_by('-created_at')
    return Response(JobSerializer(jobs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsHR])
def create_job(request):
    d = request.data
    job = Job.objects.create(
        title=d.get('title'), company=d.get('company'),
        company_logo=d.get('company_logo', ''), location=d.get('location'),
        description=d.get('description'), requirements=d.get('requirements', ''),
        job_type=d.get('job_type', 'full-time'), salary_range=d.get('salary_range', ''),
        created_by=request.user,
    )
    # Notify all customers about new job
    customers = User.objects.filter(role='customer', is_active=True)
    notifs = [Notification(
        user=c, type='new_job',
        title=f"New Job: {job.title}",
        message=f"{job.company} is hiring for {job.title} ({job.job_type}) in {job.location}.",
        link='/jobs'
    ) for c in customers]
    Notification.objects.bulk_create(notifs)

    return Response({'message': 'Job created', 'id': job.id}, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsHR])
def update_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id, created_by=request.user)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found'}, status=404)

    for f in ['title', 'company', 'company_logo', 'location', 'description',
              'requirements', 'job_type', 'salary_range', 'is_active']:
        if f in request.data:
            setattr(job, f, request.data[f])
    job.save()
    return Response({'message': 'Job updated'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsHR])
def delete_job(request, job_id):
    try:
        Job.objects.get(id=job_id, created_by=request.user).delete()
        return Response({'message': 'Job deleted'})
    except Job.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ─────────────────────────────────────────────
# APPLICATIONS
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_all_applications(request):
    apps = Application.objects.filter(
        job__created_by=request.user
    ).select_related('user', 'job').order_by('-applied_at')

    status_filter = request.query_params.get('status')
    if status_filter:
        apps = apps.filter(status=status_filter)

    return Response([{
        'id': a.id,
        'applicant': {
            'id': a.user.id, 'username': a.user.username,
            'email': a.user.email,
            'first_name': a.user.first_name, 'last_name': a.user.last_name,
            'avatar': a.user.avatar, 'headline': a.user.headline,
            'skills': a.user.get_skills_list(),
        },
        'job': {'id': a.job.id, 'title': a.job.title, 'company': a.job.company, 'location': a.job.location},
        'status': a.status, 'cover_letter': a.cover_letter,
        'applied_at': a.applied_at, 'updated_at': a.updated_at,
        'hr_notes': a.hr_notes,
    } for a in apps])


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_application_detail(request, app_id):
    try:
        a = Application.objects.select_related('user', 'job').get(id=app_id)
    except Application.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    return Response({
        'id': a.id, 'status': a.status, 'cover_letter': a.cover_letter,
        'hr_notes': a.hr_notes, 'applied_at': a.applied_at,
        'applicant': {'id': a.user.id, 'username': a.user.username, 'email': a.user.email,
                      'first_name': a.user.first_name, 'last_name': a.user.last_name,
                      'avatar': a.user.avatar},
        'job': {'id': a.job.id, 'title': a.job.title, 'company': a.job.company},
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsHR])
def update_application_status(request):
    app_id     = request.data.get('application_id')
    new_status = request.data.get('status')
    hr_notes   = request.data.get('hr_notes', '')

    try:
        app = Application.objects.select_related('user', 'job').get(id=app_id)
    except Application.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    old_status = app.status
    old_notes  = app.hr_notes or ""
    app.status     = new_status
    app.hr_notes   = hr_notes
    app.reviewed_by = request.user
    app.save()

    # Notify on status change
    if old_status != new_status:
        _notify_applicant(app, new_status)

    # Separate notification when HR adds/updates feedback notes
    if hr_notes and hr_notes.strip() != old_notes.strip():
        Notification.objects.create(
            user=app.user,
            type='feedback',
            title=f"💬 HR left feedback — {app.job.title}",
            message=hr_notes,
            link='/my-applications',
        )

    return Response({'message': f'Status updated to {new_status}'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsHR])
def bulk_update_application_status(request):
    ids        = request.data.get('application_ids', [])
    new_status = request.data.get('status')
    if not ids or not new_status:
        return Response({'error': 'application_ids and status required'}, status=400)

    apps = Application.objects.filter(id__in=ids).select_related('user', 'job')
    updated = 0
    for app in apps:
        if app.status != new_status:
            app.status      = new_status
            app.reviewed_by = request.user
            app.save()
            _notify_applicant(app, new_status)
            updated += 1

    return Response({'message': f'{updated} applications updated to {new_status}'})


# ─────────────────────────────────────────────
# TALENT POOL  (enriched)
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_talent_pool(request):
    """All students with at least one certificate, with summary stats."""
    certified_ids = Certificate.objects.values_list('user_id', flat=True).distinct()
    users = User.objects.filter(id__in=certified_ids, is_active=True)

    result = []
    for u in users:
        certs = Certificate.objects.filter(user=u).select_related('course')
        enrollments = Enrollment.objects.filter(user=u)
        event_regs = EventRegistration.objects.filter(
            user=u, status__in=['attended', 'registered']
        ).select_related('event')
        hackathons = event_regs.filter(event__event_type='hackathon').count()
        workshops  = event_regs.filter(event__event_type='workshop').count()

        result.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'avatar': u.avatar,
            'headline': u.headline,
            'location': u.location,
            'skills': u.get_skills_list(),
            'certificates_count': certs.count(),
            'courses_completed': enrollments.filter(completed=True).count(),
            'hackathons': hackathons,
            'workshops': workshops,
            'projects_count': UserProject.objects.filter(user=u).count(),
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsHR])
def get_candidate_profile(request, user_id):
    """Full candidate profile for HR — certificates, projects, events, apps."""
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # Certificates (platform)
    certs = Certificate.objects.filter(user=u).select_related('course')
    cert_data = [{
        'id': c.id, 'course_title': c.course.title,
        'certificate_id': c.certificate_id, 'issued_at': c.issued_at,
    } for c in certs]

    # Extra certificates (uploaded by user)
    extra_certs = ExtraCertificate.objects.filter(user=u).order_by('-uploaded_at')
    extra_cert_data = [{
        'id': c.id, 'title': c.title, 'issuer': c.issuer,
        'file_url': c.file_url, 'issued_date': c.issued_date,
    } for c in extra_certs]

    # Projects
    projects = UserProject.objects.filter(user=u).order_by('-created_at')
    project_data = [{
        'id': p.id, 'title': p.title, 'description': p.description,
        'tech_stack': p.get_tech_stack(), 'github_url': p.github_url,
        'live_url': p.live_url, 'thumbnail': p.thumbnail,
    } for p in projects]

    # Event participations
    event_regs = EventRegistration.objects.filter(
        user=u, status__in=['attended', 'registered', 'waitlisted']
    ).select_related('event').order_by('-registered_at')
    event_data = [{
        'id': r.id, 'event_id': r.event.id,
        'title': r.event.title, 'event_type': r.event.event_type,
        'status': r.status, 'start_date': r.event.start_date,
    } for r in event_regs]

    # Application history
    apps = Application.objects.filter(user=u).select_related('job').order_by('-applied_at')
    app_data = [{
        'job': a.job.title, 'company': a.job.company, 'status': a.status,
        'applied_at': a.applied_at,
    } for a in apps]

    enrollments = Enrollment.objects.filter(user=u)

    return Response({
        'profile': {
            'id': u.id, 'username': u.username, 'email': u.email,
            'first_name': u.first_name, 'last_name': u.last_name,
            'avatar': u.avatar, 'headline': u.headline, 'bio': u.bio,
            'location': u.location, 'github': u.github,
            'linkedin': u.linkedin, 'website': u.website,
            'skills': u.get_skills_list(),
        },
        'certificates':       cert_data,
        'extra_certificates': extra_cert_data,
        'projects':           project_data,
        'events':             event_data,
        'application_history': app_data,
        'courses_enrolled':   enrollments.count(),
        'courses_completed':  enrollments.filter(completed=True).count(),
        'total_applications': apps.count(),
        'hackathons':         len([e for e in event_data if e['event_type'] == 'hackathon']),
        'workshops':          len([e for e in event_data if e['event_type'] == 'workshop']),
    })