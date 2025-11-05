"""
Script để set password sau khi import SQL
Chạy: docker exec webgis_backend python set_passwords.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User

def set_passwords():
    print("🔐 Đang set password cho users...")

    users_passwords = [
        ('admin@webgis.com', 'admin123'),
        ('teacher@webgis.com', 'teacher123'),
        ('student1@webgis.com', 'student123'),
        ('student2@webgis.com', 'student123'),
    ]

    for email, password in users_passwords:
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            print(f"✅ {email} → password: {password}")
        except User.DoesNotExist:
            print(f"❌ Không tìm thấy user: {email}")

    print("\n🎉 Hoàn tất! Bạn có thể đăng nhập với các tài khoản trên.")

if __name__ == '__main__':
    set_passwords()
