"""
Script đơn giản để thêm dữ liệu vào database WebGIS
Chạy: python add_data.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.classrooms.models import Classroom, Enrollment
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.gis_data.models import MapLayer, VietnamProvince
from apps.quizzes.models import Quiz, QuizQuestion, QuizAnswer
from django.contrib.gis.geos import MultiPolygon, Polygon

def main():
    print("=" * 50)
    print("THÊM DỮ LIỆU VÀO DATABASE")
    print("=" * 50)

    # 1. Tạo Users
    print("\n1. Tạo Users...")
    try:
        admin = User.objects.create_superuser(
            email='admin@webgis.com',
            password='admin123',
            role='teacher'
        )
        print("  ✓ Admin: admin@webgis.com / admin123")
    except:
        print("  ⚠ Admin đã tồn tại")
        admin = User.objects.get(email='admin@webgis.com')

    try:
        teacher = User.objects.create_user(
            email='teacher@webgis.com',
            password='teacher123',
            role='teacher'
        )
        print("  ✓ Teacher: teacher@webgis.com / teacher123")
    except:
        print("  ⚠ Teacher đã tồn tại")
        teacher = User.objects.get(email='teacher@webgis.com')

    try:
        student1 = User.objects.create_user(
            email='student1@webgis.com',
            password='student123',
            role='student'
        )
        print("  ✓ Student1: student1@webgis.com / student123")
    except:
        print("  ⚠ Student1 đã tồn tại")
        student1 = User.objects.get(email='student1@webgis.com')

    # 2. Tạo Classroom
    print("\n2. Tạo Classroom...")
    classroom, created = Classroom.objects.get_or_create(
        name='Địa lý Việt Nam 11',
        teacher=teacher
    )
    if created:
        print(f"  ✓ Classroom: {classroom.name}")
        print(f"  ✓ Enrollment code: {classroom.enrollment_code}")
    else:
        print(f"  ⚠ Classroom đã tồn tại: {classroom.name}")

    # 3. Enroll student
    print("\n3. Enroll Students...")
    enrollment, created = Enrollment.objects.get_or_create(
        student=student1,
        classroom=classroom
    )
    if created:
        print(f"  ✓ Enrolled {student1.email}")
    else:
        print(f"  ⚠ Student đã enrolled")

    # 4. Tạo MapLayer
    print("\n4. Tạo GIS Layer...")
    layer, created = MapLayer.objects.get_or_create(
        name='Tỉnh thành Việt Nam',
        defaults={
            'data_source_table': 'vietnam_provinces',
            'geom_type': 'MULTIPOLYGON',
            'description': 'Administrative boundaries of Vietnam provinces',
            'is_active': True
        }
    )
    if created:
        print(f"  ✓ Layer: {layer.name}")
    else:
        print(f"  ⚠ Layer đã tồn tại")

    # 5. Tạo Provinces
    print("\n5. Tạo Vietnam Provinces...")
    provinces_data = [
        {
            'name': 'Hà Nội',
            'name_en': 'Hanoi',
            'code': 'HN',
            'region': 'North',
            'population': 8053663,
            'area_km2': 3328.9,
            'coords': [(105.7, 21.1), (105.9, 21.1), (105.9, 20.9), (105.7, 20.9), (105.7, 21.1)]
        },
        {
            'name': 'Hồ Chí Minh',
            'name_en': 'Ho Chi Minh City',
            'code': 'HCM',
            'region': 'South',
            'population': 8993082,
            'area_km2': 2061.0,
            'coords': [(106.5, 10.9), (106.9, 10.9), (106.9, 10.5), (106.5, 10.5), (106.5, 10.9)]
        },
        {
            'name': 'Đà Nẵng',
            'name_en': 'Da Nang',
            'code': 'DN',
            'region': 'Central',
            'population': 1134310,
            'area_km2': 1285.4,
            'coords': [(107.9, 16.2), (108.3, 16.2), (108.3, 15.8), (107.9, 15.8), (107.9, 16.2)]
        },
    ]

    for data in provinces_data:
        polygon = Polygon(data['coords'])
        multipolygon = MultiPolygon(polygon, srid=4326)

        province, created = VietnamProvince.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'name_en': data['name_en'],
                'region': data['region'],
                'population': data['population'],
                'area_km2': data['area_km2'],
                'geometry': multipolygon
            }
        )
        if created:
            print(f"  ✓ Province: {province.name}")
        else:
            print(f"  ⚠ {province.name} đã tồn tại")

    # 6. Tạo Lesson
    print("\n6. Tạo Lesson...")
    lesson, created = Lesson.objects.get_or_create(
        title='Khám phá bản đồ Việt Nam',
        defaults={'description': 'Bài học tương tác về các tỉnh thành Việt Nam'}
    )
    if created:
        # Tạo steps
        action1 = MapAction.objects.create(
            action_type='ZOOM_TO',
            payload={'center': [106.0, 16.0], 'zoom': 6}
        )
        LessonStep.objects.create(
            lesson=lesson,
            order=1,
            popup_text='Chào mừng bạn đến với bài học về bản đồ Việt Nam!',
            map_action=action1
        )
        print(f"  ✓ Lesson: {lesson.title}")
    else:
        print(f"  ⚠ Lesson đã tồn tại")

    # 7. Tạo Quiz
    print("\n7. Tạo Quiz...")
    quiz, created = Quiz.objects.get_or_create(
        title='Kiểm tra kiến thức Địa lý Việt Nam',
        classroom=classroom,
        defaults={'description': 'Bài kiểm tra về các tỉnh thành Việt Nam'}
    )
    if created:
        # Tạo questions
        q1 = QuizQuestion.objects.create(
            quiz=quiz,
            question_text='Thủ đô của Việt Nam là gì?',
            order=1
        )
        QuizAnswer.objects.create(question=q1, answer_text='Hà Nội', is_correct=True)
        QuizAnswer.objects.create(question=q1, answer_text='Hồ Chí Minh', is_correct=False)
        QuizAnswer.objects.create(question=q1, answer_text='Đà Nẵng', is_correct=False)
        print(f"  ✓ Quiz: {quiz.title}")
    else:
        print(f"  ⚠ Quiz đã tồn tại")

    print("\n" + "=" * 50)
    print("✅ HOÀN THÀNH!")
    print("=" * 50)
    print("\n📊 THỐNG KÊ:")
    print(f"  Users: {User.objects.count()}")
    print(f"  Classrooms: {Classroom.objects.count()}")
    print(f"  Enrollments: {Enrollment.objects.count()}")
    print(f"  Map Layers: {MapLayer.objects.count()}")
    print(f"  Provinces: {VietnamProvince.objects.count()}")
    print(f"  Lessons: {Lesson.objects.count()}")
    print(f"  Quizzes: {Quiz.objects.count()}")
    print("\n🔐 LOGIN:")
    print("  Admin: http://localhost:8000/admin/")
    print("  - Email: admin@webgis.com")
    print("  - Password: admin123")

if __name__ == '__main__':
    main()
