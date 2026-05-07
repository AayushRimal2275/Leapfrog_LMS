"""
notifications.py
Central place for creating notifications + sending emails.
Import and call these from views_hr.py whenever application status changes.
"""

from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def _send_email(to_email, subject, body):
    """Send email — fails silently so it never breaks the main flow."""
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@leapfrogconnect.com'),
            recipient_list=[to_email],
            fail_silently=True,
        )
    except Exception:
        pass


def notify_status_change(application):
    """
    Called whenever an application status changes.
    Creates an in-app notification and sends an email.
    """
    user    = application.user
    job     = application.job
    status  = application.status

    templates = {
        'hired': {
            'type':    'hired',
            'title':   f'🎉 Congratulations! You\'ve been hired at {job.company}',
            'message': f'Your application for "{job.title}" at {job.company} has been accepted. '
                       f'The HR team will contact you soon with next steps. Welcome aboard!',
            'subject': f'[Leapfrog Connect] You\'ve been hired at {job.company}!',
        },
        'interview': {
            'type':    'interview',
            'title':   f'📅 Interview scheduled — {job.title} at {job.company}',
            'message': f'Great news! Your application for "{job.title}" at {job.company} has been shortlisted '
                       f'for an interview. The HR team will reach out to confirm the schedule.',
            'subject': f'[Leapfrog Connect] Interview scheduled for {job.title}',
        },
        'rejected': {
            'type':    'rejected',
            'title':   f'Application update — {job.title} at {job.company}',
            'message': f'Thank you for applying for "{job.title}" at {job.company}. Unfortunately, '
                       f'your application was not selected at this time. Keep learning and applying!',
            'subject': f'[Leapfrog Connect] Application update for {job.title}',
        },
        'applied': {
            'type':    'status',
            'title':   f'Application submitted — {job.title}',
            'message': f'Your application for "{job.title}" at {job.company} is under review.',
            'subject': f'[Leapfrog Connect] Application received for {job.title}',
        },
    }

    tmpl = templates.get(status)
    if not tmpl:
        return

    # Create in-app notification
    Notification.objects.create(
        user=user,
        type=tmpl['type'],
        title=tmpl['title'],
        message=tmpl['message'],
        application=application,
    )

    # Send email
    email_body = f"""Hi {user.first_name or user.username},

{tmpl['message']}

---
Job:     {job.title}
Company: {job.company}
Status:  {status.upper()}

Log in to Leapfrog Connect to view your full application status:
https://leapfrogconnect.com/my-applications

— Leapfrog Connect Team
"""
    _send_email(user.email, tmpl['subject'], email_body)


def notify_hr_feedback(application, feedback_text):
    """
    Called when HR saves a note on an application.
    Notifies the candidate that feedback was left.
    """
    user = application.user
    job  = application.job

    Notification.objects.create(
        user=user,
        type='feedback',
        title=f'💬 HR left feedback on your application — {job.title}',
        message=feedback_text,
        application=application,
    )

    email_body = f"""Hi {user.first_name or user.username},

The HR team at {job.company} has left feedback on your application for "{job.title}":

"{feedback_text}"

Log in to Leapfrog Connect to view your full application:
https://leapfrogconnect.com/my-applications

— Leapfrog Connect Team
"""
    _send_email(
        user.email,
        f'[Leapfrog Connect] HR feedback on your {job.title} application',
        email_body,
    )