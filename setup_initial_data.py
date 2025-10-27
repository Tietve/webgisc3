"""
Script tự động setup database ban đầu
- Tạo superuser
- Tạo giáo viên và học sinh mẫu
- Tạo lớp học mẫu
- Enable PostGIS extension
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.classrooms.models import Classroom
from apps.lessons.models import Lesson
from django.db import connection

User = get_user_model()

def setup_database():
    print("🚀 Bắt đầu setup database...")

    # 1. Enable PostGIS extension
    print("\n📍 Enable PostGIS extension...")
    with connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    print("✅ PostGIS đã được enable!")

    # 2. Tạo Superuser
    print("\n👤 Tạo Superuser...")
    if not User.objects.filter(email='admin@webgis.com').exists():
        admin = User.objects.create_superuser(
            email='admin@webgis.com',
            password='admin123',
            role='admin'
        )
        print(f"✅ Đã tạo superuser: admin@webgis.com / admin123")
    else:
        print("⏭️ Superuser 'admin@webgis.com' đã tồn tại")

    # 3. Tạo Giáo viên mẫu
    print("\n👨‍🏫 Tạo giáo viên mẫu...")
    if not User.objects.filter(email='teacher01@webgis.com').exists():
        teacher = User.objects.create_user(
            email='teacher01@webgis.com',
            password='teacher123',
            role='teacher',
            is_staff=True
        )
        print(f"✅ Đã tạo giáo viên: teacher01@webgis.com / teacher123")
    else:
        teacher = User.objects.get(email='teacher01@webgis.com')
        print("⏭️ Giáo viên 'teacher01@webgis.com' đã tồn tại")

    # 4. Tạo Học sinh mẫu
    print("\n👨‍🎓 Tạo học sinh mẫu...")
    students = []
    student_emails = [
        'student01@webgis.com',
        'student02@webgis.com',
        'student03@webgis.com',
    ]

    for email in student_emails:
        if not User.objects.filter(email=email).exists():
            student = User.objects.create_user(
                email=email,
                password='student123',
                role='student'
            )
            students.append(student)
            print(f"✅ Đã tạo học sinh: {email} / student123")
        else:
            students.append(User.objects.get(email=email))
            print(f"⏭️ Học sinh '{email}' đã tồn tại")

    # 5. Tạo Lớp học mẫu
    print("\n🏫 Tạo lớp học mẫu...")
    if not Classroom.objects.filter(name='GIS Cơ Bản 101').exists():
        classroom = Classroom.objects.create(
            name='GIS Cơ Bản 101',
            teacher=teacher,
            enrollment_code='GIS101'
        )
        print(f"✅ Đã tạo lớp học: GIS Cơ Bản 101")
        print(f"   - Mã lớp: GIS101")
        print(f"   - Giáo viên: {teacher.email}")
    else:
        classroom = Classroom.objects.get(name='GIS Cơ Bản 101')
        print("⏭️ Lớp học 'GIS Cơ Bản 101' đã tồn tại")

    # Thêm học sinh vào lớp
    print("\n👥 Thêm học sinh vào lớp...")
    from apps.classrooms.models import Enrollment
    for student in students:
        if not Enrollment.objects.filter(student=student, classroom=classroom).exists():
            Enrollment.objects.create(
                student=student,
                classroom=classroom
            )
            print(f"✅ Đã thêm {student.email} vào lớp")
        else:
            print(f"⏭️ {student.email} đã có trong lớp")
    print(f"   - Tổng số học sinh: {Enrollment.objects.filter(classroom=classroom).count()}")

    # 6. Tạo Bài học mẫu
    print("\n📚 Tạo bài học mẫu...")

    lessons_data = [
        ('Bài 1: Giới thiệu GIS', 'Tìm hiểu về khái niệm GIS và ứng dụng trong thực tế'),
        ('Bài 2: Hệ tọa độ', 'Tìm hiểu về hệ tọa độ địa lý và projection'),
        ('Bài 3: Dữ liệu Vector', 'Làm việc với dữ liệu Point, Line, Polygon'),
    ]

    for title, description in lessons_data:
        if not Lesson.objects.filter(title=title).exists():
            lesson = Lesson.objects.create(
                title=title,
                description=description
            )
            print(f"✅ Đã tạo bài học: {title}")
        else:
            print(f"⏭️ Bài học '{title}' đã tồn tại")

    # 7. Tạo bảng GIS mẫu
    print("\n🗺️ Tạo bảng GIS mẫu...")
    with connection.cursor() as cursor:
        # Tạo bảng points_of_interest
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS points_of_interest (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                geometry GEOMETRY(Point, 4326)
            );
        """)

        # Tạo spatial index
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_poi_geometry
            ON points_of_interest USING GIST (geometry);
        """)

        # Kiểm tra xem đã có dữ liệu chưa
        cursor.execute("SELECT COUNT(*) FROM points_of_interest;")
        count = cursor.fetchone()[0]

        if count == 0:
            # Thêm một số điểm mẫu
            cursor.execute("""
                INSERT INTO points_of_interest (name, category, description, geometry)
                VALUES
                    ('Hồ Hoàn Kiếm', 'Hồ nước', 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
                     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0285]}')),

                    ('Chợ Bến Thành', 'Chợ', 'Chợ truyền thống lớn nhất TP.HCM',
                     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981, 10.7720]}')),

                    ('Phố cổ Hội An', 'Di tích', 'Khu phố cổ được UNESCO công nhận',
                     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.3277, 15.8801]}'));
            """)
            print("✅ Đã tạo bảng 'points_of_interest' với 3 điểm mẫu")
        else:
            print(f"⏭️ Bảng 'points_of_interest' đã có {count} điểm")

        # Tạo bảng boundaries (ranh giới)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS boundaries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                code VARCHAR(50),
                population INTEGER,
                area_km2 DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT NOW(),
                geometry GEOMETRY(MultiPolygon, 4326)
            );
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_boundaries_geometry
            ON boundaries USING GIST (geometry);
        """)

        print("✅ Đã tạo bảng 'boundaries' (sẵn sàng để thêm ranh giới)")

        # Tạo bảng routes (đường đi)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS routes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                length_km DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT NOW(),
                geometry GEOMETRY(LineString, 4326)
            );
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_routes_geometry
            ON routes USING GIST (geometry);
        """)

        print("✅ Đã tạo bảng 'routes' (sẵn sàng để thêm tuyến đường)")

    print("\n" + "="*60)
    print("🎉 SETUP HOÀN TẤT!")
    print("="*60)
    print("\n📋 Thông tin đăng nhập:")
    print("   Django Admin: http://localhost:8080/admin/")
    print("   - Email: admin@webgis.com")
    print("   - Password: admin123")
    print("\n   pgAdmin: http://localhost:5050")
    print("   - Email: admin@webgis.com")
    print("   - Password: admin123")
    print("\n👥 Tài khoản đã tạo:")
    print("   - Giáo viên: teacher01@webgis.com / teacher123")
    print("   - Học sinh: student01@webgis.com, student02@webgis.com, student03@webgis.com / student123")
    print("\n🗺️ Bảng GIS đã tạo:")
    print("   - points_of_interest (điểm quan tâm)")
    print("   - boundaries (ranh giới - MultiPolygon)")
    print("   - routes (tuyến đường - LineString)")
    print("\n💡 Bạn có thể:")
    print("   1. Vào Django Admin để quản lý user, classroom, lesson")
    print("   2. Vào pgAdmin để thêm dữ liệu GIS vào các bảng trên")
    print("="*60)

if __name__ == '__main__':
    try:
        setup_database()
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
