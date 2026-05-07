import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'adminpassword'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password, role='admin')
    print(f"Superuser '{username}' created successfully with 'admin' role.")
else:
    user = User.objects.get(username=username)
    user.role = 'admin'
    user.save()
    print(f"Superuser '{username}' already exists. Role updated to 'admin'.")

