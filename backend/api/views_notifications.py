"""
views_notifications.py
Notification + Password Reset + Extra Certificates + Projects
"""
import json
import uuid
from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Notification, ExtraCertificate, UserProject

User = get_user_model()


# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifs = Notification.objects.filter(user=request.user).order_by("-created_at")
    unread = notifs.filter(is_read=False).count()
    notifs = notifs[:50]
    return Response({
        'notifications': [{
            'id': n.id, 'type': n.type, 'title': n.title,
            'message': n.message, 'is_read': n.is_read,
            'created_at': n.created_at, 'link': n.link,
        } for n in notifs],
        'unread_count': unread,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All marked as read'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_one_read(request, notif_id):
    try:
        n = Notification.objects.get(id=notif_id, user=request.user)
        n.is_read = True
        n.save()
        return Response({'message': 'Marked read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ─────────────────────────────────────────────
# PASSWORD RESET (email-based)
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    # Always return success to avoid email enumeration
    user = User.objects.filter(email__iexact=email).first()
    if user:
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{django_settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        try:
            send_mail(
                subject="Reset your Leapfrog Connect password",
                message=f"""Hi {user.first_name or user.username},

You requested a password reset. Click the link below:

{reset_url}

This link expires in 24 hours. If you didn't request this, ignore this email.

— Leapfrog Connect Team
""",
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass  # Don't leak errors

    return Response({'message': 'If that email exists, a reset link has been sent.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    uid      = request.data.get('uid', '')
    token    = request.data.get('token', '')
    password = request.data.get('password', '')

    if not all([uid, token, password]):
        return Response({'error': 'uid, token and password are required'}, status=400)

    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=400)

    try:
        pk   = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=pk)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Invalid reset link'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Reset link has expired or is invalid'}, status=400)

    user.set_password(password)
    user.save()
    return Response({'message': 'Password reset successfully. Please sign in.'})


# ─────────────────────────────────────────────
# EXTRA CERTIFICATES (customer uploads)
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_extra_certificates(request):
    certs = ExtraCertificate.objects.filter(user=request.user).order_by('-uploaded_at')
    return Response([{
        'id': c.id, 'title': c.title, 'issuer': c.issuer,
        'file_url': c.file_url, 'issued_date': c.issued_date,
        'uploaded_at': c.uploaded_at,
    } for c in certs])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_extra_certificate(request):
    title    = request.data.get('title', '').strip()
    file_url = request.data.get('file_url', '').strip()
    if not title:
        return Response({'error': 'Title is required'}, status=400)
    if not file_url:
        return Response({'error': 'file_url is required (upload to Cloudinary/S3 first)'}, status=400)

    cert = ExtraCertificate.objects.create(
        user=request.user,
        title=title,
        issuer=request.data.get('issuer', ''),
        file_url=file_url,
        issued_date=request.data.get('issued_date') or None,
    )
    return Response({'message': 'Certificate added', 'id': cert.id}, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_extra_certificate(request, cert_id):
    try:
        ExtraCertificate.objects.get(id=cert_id, user=request.user).delete()
        return Response({'message': 'Deleted'})
    except ExtraCertificate.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ─────────────────────────────────────────────
# USER PROJECTS
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_projects(request):
    projects = UserProject.objects.filter(user=request.user).order_by('-created_at')
    return Response([_project_dict(p) for p in projects])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_project(request):
    title = request.data.get('title', '').strip()
    if not title:
        return Response({'error': 'Title is required'}, status=400)

    tech = request.data.get('tech_stack', [])
    p = UserProject.objects.create(
        user=request.user,
        title=title,
        description=request.data.get('description', ''),
        tech_stack=json.dumps(tech if isinstance(tech, list) else [tech]),
        github_url=request.data.get('github_url', ''),
        live_url=request.data.get('live_url', ''),
        thumbnail=request.data.get('thumbnail', ''),
    )
    return Response({'message': 'Project added', 'id': p.id}, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_project(request, project_id):
    try:
        p = UserProject.objects.get(id=project_id, user=request.user)
    except UserProject.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    for field in ['title', 'description', 'github_url', 'live_url', 'thumbnail']:
        if field in request.data:
            setattr(p, field, request.data[field])
    if 'tech_stack' in request.data:
        tech = request.data['tech_stack']
        p.tech_stack = json.dumps(tech if isinstance(tech, list) else [tech])
    p.save()
    return Response({'message': 'Updated', 'project': _project_dict(p)})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    try:
        UserProject.objects.get(id=project_id, user=request.user).delete()
        return Response({'message': 'Deleted'})
    except UserProject.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


def _project_dict(p):
    return {
        'id': p.id, 'title': p.title, 'description': p.description,
        'tech_stack': p.get_tech_stack(), 'github_url': p.github_url,
        'live_url': p.live_url, 'thumbnail': p.thumbnail,
        'created_at': p.created_at,
    }