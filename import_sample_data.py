"""
Script để import dữ liệu mẫu vào database
Chạy: docker exec -it webgis_backend python import_sample_data.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.classrooms.models import Classroom, Enrollment
from apps.gis_data.models import MapLayer
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.quizzes.models import Quiz, QuizQuestion, QuizAnswer
from django.contrib.gis.geos import Point, LineString, Polygon
from django.utils import timezone

print("=" * 50)
print("BẮT ĐẦU IMPORT DỮ LIỆU MẪU")
print("=" * 50)

# 1. Xóa dữ liệu cũ (nếu có)
print("\n1. Xóa dữ liệu cũ...")
User.objects.all().delete()
Classroom.objects.all().delete()
MapLayer.objects.all().delete()
Lesson.objects.all().delete()
Quiz.objects.all().delete()
print("   ✓ Đã xóa dữ liệu cũ")

# 2. Tạo Users
print("\n2. Tạo người dùng...")
admin = User.objects.create_superuser(
    email='admin@webgis.com',
    password='admin123',
    role='teacher'
)
print(f"   ✓ Admin: {admin.email}")

teacher = User.objects.create_user(
    email='teacher@webgis.com',
    password='teacher123',
    role='teacher',
    is_staff=True
)
print(f"   ✓ Teacher: {teacher.email}")

student1 = User.objects.create_user(
    email='student1@webgis.com',
    password='student123',
    role='student'
)
print(f"   ✓ Student 1: {student1.email}")

student2 = User.objects.create_user(
    email='student2@webgis.com',
    password='student123',
    role='student'
)
print(f"   ✓ Student 2: {student2.email}")

# 3. Tạo Classrooms
print("\n3. Tạo lớp học...")
classroom = Classroom.objects.create(
    name='Địa lý Việt Nam 11',
    enrollment_code='GIS2024',
    teacher=teacher
)
print(f"   ✓ Lớp học: {classroom.name} (Mã: {classroom.enrollment_code})")

# 4. Tạo Enrollments
print("\n4. Thêm học sinh vào lớp...")
enrollment1 = Enrollment.objects.create(
    student=student1,
    classroom=classroom
)
print(f"   ✓ {student1.email} → {classroom.name}")

enrollment2 = Enrollment.objects.create(
    student=student2,
    classroom=classroom
)
print(f"   ✓ {student2.email} → {classroom.name}")

# 5. Tạo Map Layers
print("\n5. Tạo các lớp bản đồ...")

# Layer 1: Vietnam Provinces
layer1 = MapLayer.objects.create(
    name='Tỉnh thành Việt Nam',
    data_source_table='vietnam_provinces',
    geom_type='Polygon',
    description='Bản đồ hành chính 63 tỉnh thành Việt Nam',
    is_active=True
)
print(f"   ✓ {layer1.name}")

# Layer 2: Sample Points
layer2 = MapLayer.objects.create(
    name='Địa điểm quan trọng',
    data_source_table='sample_points',
    geom_type='Point',
    description='Các địa điểm du lịch và văn hóa',
    is_active=True
)
print(f"   ✓ {layer2.name}")

# 6. Tạo Lessons
print("\n6. Tạo bài học...")

lesson1 = Lesson.objects.create(
    title='Làm quen với bản đồ',
    description='Học cách sử dụng các công cụ cơ bản trên bản đồ'
)
print(f"   ✓ Bài học: {lesson1.title}")

# Tạo Map Actions cho lesson
action1 = MapAction.objects.create(
    action_type='zoom',
    payload={'level': 6, 'center': [105.8, 21.0]}
)

action2 = MapAction.objects.create(
    action_type='show_layer',
    payload={'layer_id': layer1.id, 'layer_name': layer1.name}
)

# Tạo Lesson Steps
step1 = LessonStep.objects.create(
    lesson=lesson1,
    order=1,
    popup_text='Chào mừng bạn đến với bài học đầu tiên! Hãy quan sát bản đồ Việt Nam.',
    map_action=action1
)

step2 = LessonStep.objects.create(
    lesson=lesson1,
    order=2,
    popup_text='Bây giờ chúng ta sẽ xem lớp bản đồ tỉnh thành.',
    map_action=action2
)
print(f"   ✓ Đã tạo 2 bước học")

lesson2 = Lesson.objects.create(
    title='Tìm hiểu về hành chính Việt Nam',
    description='Tìm hiểu về các đơn vị hành chính của Việt Nam'
)
print(f"   ✓ Bài học: {lesson2.title}")

# 7. Tạo Quizzes
print("\n7. Tạo bài kiểm tra...")

quiz1 = Quiz.objects.create(
    title='Kiểm tra: Bản đồ cơ bản',
    description='Kiểm tra kiến thức về bản đồ và hành chính Việt Nam',
    classroom=classroom
)
print(f"   ✓ {quiz1.title}")

# Câu hỏi 1
q1 = QuizQuestion.objects.create(
    quiz=quiz1,
    question_text='Việt Nam có bao nhiêu tỉnh thành?',
    order=1
)
QuizAnswer.objects.create(question=q1, answer_text='60', is_correct=False)
QuizAnswer.objects.create(question=q1, answer_text='63', is_correct=True)
QuizAnswer.objects.create(question=q1, answer_text='64', is_correct=False)
QuizAnswer.objects.create(question=q1, answer_text='65', is_correct=False)
print(f"   ✓ Câu 1: {q1.question_text}")

# Câu hỏi 2
q2 = QuizQuestion.objects.create(
    quiz=quiz1,
    question_text='Thủ đô của Việt Nam là gì?',
    order=2
)
QuizAnswer.objects.create(question=q2, answer_text='Hồ Chí Minh', is_correct=False)
QuizAnswer.objects.create(question=q2, answer_text='Hà Nội', is_correct=True)
QuizAnswer.objects.create(question=q2, answer_text='Đà Nẵng', is_correct=False)
QuizAnswer.objects.create(question=q2, answer_text='Cần Thơ', is_correct=False)
print(f"   ✓ Câu 2: {q2.question_text}")

print("\n" + "=" * 50)
print("HOÀN THÀNH IMPORT DỮ LIỆU!")
print("=" * 50)
print("\nThông tin đăng nhập:")
print("  Admin:")
print("    Email: admin@webgis.com")
print("    Password: admin123")
print("\n  Teacher:")
print("    Email: teacher@webgis.com")
print("    Password: teacher123")
print("\n  Students:")
print("    Email: student1@webgis.com / student2@webgis.com")
print("    Password: student123")
print("\n" + "=" * 50)
