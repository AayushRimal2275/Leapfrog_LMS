from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_application_hr_notes_application_reviewed_by_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('event_type', models.CharField(choices=[('hackathon','Hackathon'),('workshop','Workshop'),('webinar','Webinar'),('bootcamp','Bootcamp')], default='workshop', max_length=20)),
                ('status', models.CharField(choices=[('upcoming','Upcoming'),('ongoing','Ongoing'),('completed','Completed'),('cancelled','Cancelled')], default='upcoming', max_length=20)),
                ('thumbnail', models.URLField(blank=True, default='')),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('location', models.CharField(blank=True, default='Online', max_length=255)),
                ('max_participants', models.IntegerField(default=100)),
                ('registration_fee', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('is_free', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_events', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='EventRegistration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('registered','Registered'),('waitlisted','Waitlisted'),('cancelled','Cancelled'),('attended','Attended')], default='registered', max_length=20)),
                ('payment_status', models.CharField(choices=[('pending','Pending'),('paid','Paid'),('refunded','Refunded'),('waived','Waived')], default='waived', max_length=20)),
                ('registered_at', models.DateTimeField(auto_now_add=True)),
                ('payment_proof', models.URLField(blank=True, default='')),
                ('notes', models.TextField(blank=True, default='')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='event_registrations', to=settings.AUTH_USER_MODEL)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='registrations', to='api.event')),
            ],
            options={'unique_together': {('user', 'event')}},
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('hired','Hired'),('interview','Interview Invite'),('rejected','Rejected'),('status','Status Update'),('new_course','New Course'),('new_job','New Job'),('new_event','New Event'),('certificate','Certificate Earned'),('feedback','Feedback')], default='status', max_length=20)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('link', models.CharField(blank=True, default='', max_length=255)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ExtraCertificate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('issuer', models.CharField(blank=True, default='', max_length=255)),
                ('file_url', models.URLField(blank=True, default='')),
                ('issued_date', models.DateField(blank=True, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='extra_certificates', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('tech_stack', models.TextField(blank=True, default='[]')),
                ('github_url', models.URLField(blank=True, default='')),
                ('live_url', models.URLField(blank=True, default='')),
                ('thumbnail', models.URLField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]