"""
notifications.py
Central place for creating notifications + sending emails.
"""

from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def _send_email(to_email, subject, body):
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
    user   = application.user
    job    = application.job
    status = application.status

    templates = {
        'hired': {
            'type':    'hired',
            'title':   f'🎉 Congratulations! You\'ve been hired at {job.company}',
            'message': f'Your application for "{job.title}" at {job.company} has been accepted. '
                       f'The HR team will contact you soon with next steps. Welcome aboard!',
            'subject': f'[Leapfrog Connect] You\'ve been hired at {job.company}!',
            'link':    '/my-applications',
        },
        'interview': {
            'type':    'interview',
            'title':   f'📅 Interview scheduled — {job.title} at {job.company}',
            'message': f'Your application for "{job.title}" at {job.company} has been shortlisted for an interview.',
            'subject': f'[Leapfrog Connect] Interview scheduled for {job.title}',
            'link':    '/my-applications',
        },
        'rejected': {
            'type':    'rejected',
            'title':   f'Application update — {job.title} at {job.company}',
            'message': f'Thank you for applying for "{job.title}" at {job.company}. Unfortunately your application was not selected at this time.',
            'subject': f'[Leapfrog Connect] Application update for {job.title}',
            'link':    '/my-applications',
        },
        'applied': {
            'type':    'status',
            'title':   f'Application submitted — {job.title}',
            'message': f'Your application for "{job.title}" at {job.company} is under review.',
            'subject': f'[Leapfrog Connect] Application received for {job.title}',
            'link':    '/my-applications',
        },
    }

    tmpl = templates.get(status)
    if not tmpl:
        return

    # ✅ Fixed: use 'link' not 'application=' (model has no application FK)
    Notification.objects.create(
        user=user,
        type=tmpl['type'],
        title=tmpl['title'],
        message=tmpl['message'],
        link=tmpl['link'],
    )

    email_body = f"""Hi {user.first_name or user.username},

{tmpl['message']}

---
Job:     {job.title}
Company: {job.company}
Status:  {status.upper()}

Log in to view your application: https://leapfrogconnect.com/my-applications

— Leapfrog Connect Team
"""
    _send_email(user.email, tmpl['subject'], email_body)


def notify_hr_feedback(application, feedback_text):
    user = application.user
    job  = application.job

    # ✅ Fixed: use 'link' not 'application='
    Notification.objects.create(
        user=user,
        type='feedback',
        title=f'💬 HR left feedback on your application — {job.title}',
        message=feedback_text,
        link='/my-applications',
    )

    _send_email(
        user.email,
        f'[Leapfrog Connect] HR feedback on your {job.title} application',
        f'Hi {user.first_name or user.username},\n\nFeedback from {job.company}:\n"{feedback_text}"\n\n— Leapfrog Connect Team',
    )