"""
views_social_auth.py
Google + Facebook token-based social login.
Exchange a Google/Facebook access token for our own JWT.
"""
import requests
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id, 'username': user.username,
            'email': user.email, 'role': user.role,
            'first_name': user.first_name, 'last_name': user.last_name,
            'avatar': user.avatar,
        }
    }


def _get_or_create_social_user(email, first_name, last_name, avatar):
    """Find or create a user by email, set avatar from social provider."""
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'customer',
        }
    )
    if created:
        user.set_unusable_password()
    if avatar and not user.avatar:
        user.avatar = avatar
    if first_name and not user.first_name:
        user.first_name = first_name
    if last_name and not user.last_name:
        user.last_name = last_name
    user.save()
    return user


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    POST { "access_token": "<Google OAuth access token>" }
    Returns our JWT pair.
    """
    access_token = request.data.get('access_token', '').strip()
    if not access_token:
        return Response({'error': 'access_token is required'}, status=400)

    # Verify with Google
    r = requests.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10,
    )
    if r.status_code != 200:
        return Response({'error': 'Invalid Google token'}, status=400)

    info = r.json()
    email = info.get('email')
    if not email:
        return Response({'error': 'Google account has no email'}, status=400)

    user = _get_or_create_social_user(
        email=email,
        first_name=info.get('given_name', ''),
        last_name=info.get('family_name', ''),
        avatar=info.get('picture', ''),
    )
    return Response(_issue_tokens(user))

