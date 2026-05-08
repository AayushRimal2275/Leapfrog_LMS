"""
views_events.py
Admin manages events. Customers register/waitlist.
"""
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings as django_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Event, EventRegistration, Notification
from .permissions import IsAdmin


# ─────────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def list_events(request):
    events = Event.objects.all().order_by('-start_date')
    status_filter = request.query_params.get('status')
    type_filter = request.query_params.get('type')
    if status_filter:
        events = events.filter(status=status_filter)
    if type_filter:
        events = events.filter(event_type=type_filter)

    return Response([{
        'id': e.id,
        'title': e.title,
        'description': e.description,
        'event_type': e.event_type,
        'status': e.status,
        'thumbnail': e.thumbnail,
        'start_date': e.start_date,
        'end_date': e.end_date,
        'location': e.location,
        'max_participants': e.max_participants,
        'registered_count': e.registered_count,
        'is_full': e.is_full,
        'registration_fee': str(e.registration_fee),
        'is_free': e.is_free,
    } for e in events])


@api_view(['GET'])
@permission_classes([AllowAny])
def event_detail(request, event_id):
    try:
        e = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)

    my_reg = None
    if request.user.is_authenticated:
        reg = EventRegistration.objects.filter(user=request.user, event=e).first()
        if reg:
            my_reg = {'status': reg.status, 'payment_status': reg.payment_status, 'registered_at': reg.registered_at}

    return Response({
        'id': e.id, 'title': e.title, 'description': e.description,
        'event_type': e.event_type, 'status': e.status, 'thumbnail': e.thumbnail,
        'start_date': e.start_date, 'end_date': e.end_date, 'location': e.location,
        'max_participants': e.max_participants, 'registered_count': e.registered_count,
        'is_full': e.is_full, 'registration_fee': str(e.registration_fee),
        'is_free': e.is_free, 'my_registration': my_reg,
    })


# ─────────────────────────────────────────────
# CUSTOMER
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)

    if EventRegistration.objects.filter(user=request.user, event=event).exists():
        return Response({'error': 'Already registered'}, status=400)

    # Waitlist if full
    status = 'waitlisted' if event.is_full else 'registered'
    payment_status = 'waived' if event.is_free else 'pending'

    reg = EventRegistration.objects.create(
        user=request.user, event=event,
        status=status, payment_status=payment_status
    )

    # Notification to the registering user
    Notification.objects.create(
        user=request.user,
        type='new_event',
        title=f"Registered for {event.title}",
        message=f"You're {'waitlisted' if status == 'waitlisted' else 'registered'} for {event.title} on {event.start_date.strftime('%b %d, %Y')}.",
        link='/events'
    )

    # Notify all admins
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admins = User.objects.filter(role='admin', is_active=True)
    admin_notifs = [Notification(
        user=a, type='status',
        title=f"New event registration: {event.title}",
        message=f"{request.user.get_full_name() or request.user.username} registered for '{event.title}'.",
        link='/admin/events'
    ) for a in admins]
    if admin_notifs:
        Notification.objects.bulk_create(admin_notifs)

    return Response({'message': f'Successfully {status}', 'status': status, 'payment_status': payment_status}, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_event_registration(request, event_id):
    try:
        reg = EventRegistration.objects.get(user=request.user, event_id=event_id)
        reg.status = 'cancelled'
        reg.save()
        # Promote first waitlisted
        next_wait = EventRegistration.objects.filter(event_id=event_id, status='waitlisted').order_by('registered_at').first()
        if next_wait:
            next_wait.status = 'registered'
            next_wait.save()
            Notification.objects.create(
                user=next_wait.user, type='new_event',
                title=f"Spot available: {reg.event.title}",
                message=f"A spot opened up — you're now registered for {reg.event.title}!",
                link='/events'
            )
        return Response({'message': 'Registration cancelled'})
    except EventRegistration.DoesNotExist:
        return Response({'error': 'Not registered'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_events(request):
    regs = EventRegistration.objects.filter(
        user=request.user
    ).exclude(status='cancelled').select_related('event').order_by('-registered_at')
    return Response([{
        'id': r.id, 'event_id': r.event.id, 'title': r.event.title,
        'event_type': r.event.event_type, 'status': r.status,
        'payment_status': r.payment_status, 'start_date': r.event.start_date,
        'end_date': r.event.end_date, 'location': r.event.location,
        'thumbnail': r.event.thumbnail, 'registered_at': r.registered_at,
    } for r in regs])


# ─────────────────────────────────────────────
# ADMIN — Event CRUD
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_list_events(request):
    events = Event.objects.all().order_by('-created_at')
    return Response([{
        'id': e.id, 'title': e.title, 'event_type': e.event_type,
        'status': e.status, 'start_date': e.start_date, 'end_date': e.end_date,
        'location': e.location, 'max_participants': e.max_participants,
        'registered_count': e.registered_count, 'is_free': e.is_free,
        'registration_fee': str(e.registration_fee), 'thumbnail': e.thumbnail,
        'description': e.description,
    } for e in events])


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_event(request):
    d = request.data
    required = ['title', 'description', 'event_type', 'start_date', 'end_date']
    for f in required:
        if not d.get(f):
            return Response({'error': f'{f} is required'}, status=400)

    # Safely coerce types — HTML forms send strings, JSON sends proper types
    raw_is_free = d.get('is_free', True)
    if isinstance(raw_is_free, str):
        is_free = raw_is_free.lower() not in ('false', '0', '')
    else:
        is_free = bool(raw_is_free)

    try:
        max_p = int(d.get('max_participants') or 100)
    except (ValueError, TypeError):
        max_p = 100

    try:
        reg_fee = float(d.get('registration_fee') or 0)
    except (ValueError, TypeError):
        reg_fee = 0

    event = Event.objects.create(
        title=d['title'], description=d['description'],
        event_type=d['event_type'], status=d.get('status', 'upcoming'),
        thumbnail=d.get('thumbnail', ''), start_date=d['start_date'],
        end_date=d['end_date'], location=d.get('location', 'Online'),
        max_participants=max_p,
        registration_fee=reg_fee,
        is_free=is_free, created_by=request.user,
    )

    # Notify all customers
    from django.contrib.auth import get_user_model
    User = get_user_model()
    customers = User.objects.filter(role='customer', is_active=True)
    # Refresh from DB so start_date is a proper datetime object, not a raw string
    event.refresh_from_db()
    try:
        date_str = event.start_date.strftime('%b %d, %Y')
    except Exception:
        date_str = str(event.start_date)[:10]
    notifs = [Notification(
        user=c, type='new_event',
        title=f"New {event.event_type.title()}: {event.title}",
        message=f"{event.title} is happening on {date_str} at {event.location}. Register now!",
        link='/events'
    ) for c in customers]
    Notification.objects.bulk_create(notifs)

    return Response({'message': 'Event created', 'id': event.id}, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)

    d = request.data
    for field in ['title', 'description', 'event_type', 'status', 'thumbnail',
                  'start_date', 'end_date', 'location', 'max_participants',
                  'registration_fee', 'is_free']:
        if field in d:
            setattr(event, field, d[field])
    event.save()
    return Response({'message': 'Event updated'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_event(request, event_id):
    try:
        Event.objects.get(id=event_id).delete()
        return Response({'message': 'Event deleted'})
    except Event.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def event_registrations(request, event_id):
    regs = EventRegistration.objects.filter(event_id=event_id).select_related('user')
    return Response([{
        'id': r.id, 'user_id': r.user.id,
        'username': r.user.username,
        'name': f"{r.user.first_name} {r.user.last_name}".strip() or r.user.username,
        'email': r.user.email, 'status': r.status,
        'payment_status': r.payment_status, 'registered_at': r.registered_at,
    } for r in regs])


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_registration_status(request, reg_id):
    try:
        reg = EventRegistration.objects.select_related('user', 'event').get(id=reg_id)
    except EventRegistration.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    new_status = request.data.get('status')
    new_payment = request.data.get('payment_status')
    if new_status:
        reg.status = new_status
    if new_payment:
        reg.payment_status = new_payment
    reg.save()

    Notification.objects.create(
        user=reg.user, type='new_event',
        title=f"Registration update: {reg.event.title}",
        message=f"Your registration status is now '{new_status or reg.status}' for {reg.event.title}.",
        link='/events'
    )
    return Response({'message': 'Updated'})