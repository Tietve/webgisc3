"""
Script to create demo users for WebGIS platform.
Run inside Django container: python create_demo_users.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User

# Create superuser
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        email='admin@example.com',
        password='admin123'
    )
    print('✅ Created superuser: admin@example.com / admin123')
else:
    print('ℹ️  Superuser already exists')

# Create teacher
if not User.objects.filter(email='teacher@example.com').exists():
    User.objects.create_user(
        email='teacher@example.com',
        password='teacher123',
        role='teacher'
    )
    print('✅ Created teacher: teacher@example.com / teacher123')
else:
    print('ℹ️  Teacher already exists')

# Create student
if not User.objects.filter(email='student@example.com').exists():
    User.objects.create_user(
        email='student@example.com',
        password='student123',
        role='student'
    )
    print('✅ Created student: student@example.com / student123')
else:
    print('ℹ️  Student already exists')

print('\n🎉 Demo users ready!')
