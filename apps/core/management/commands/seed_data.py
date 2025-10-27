"""
Management command to seed the database with sample data.

Usage:
    python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import MultiPolygon, Polygon
from apps.users.models import User
from apps.classrooms.models import Classroom, Enrollment
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.gis_data.models import MapLayer, VietnamProvince
from apps.quizzes.models import Quiz, QuizQuestion, QuizAnswer


class Command(BaseCommand):
    help = 'Seed the database with sample data for WebGIS platform'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')

        # Clear existing data
        self.stdout.write('Clearing existing data...')
        self.clear_data()

        # Create users
        self.stdout.write('Creating users...')
        users = self.create_users()

        # Create classroom
        self.stdout.write('Creating classroom...')
        classroom = self.create_classroom(users['teacher'])

        # Enroll students
        self.stdout.write('Enrolling students...')
        self.enroll_students(classroom, [users['student1'], users['student2']])

        # Create GIS layers and data
        self.stdout.write('Creating GIS layers and sample data...')
        self.create_gis_data()

        # Create interactive lesson
        self.stdout.write('Creating interactive lesson...')
        self.create_lesson()

        # Create quiz
        self.stdout.write('Creating quiz...')
        self.create_quiz(classroom)

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.print_summary(users, classroom)

    def clear_data(self):
        """Clear existing data."""
        QuizAnswer.objects.all().delete()
        QuizQuestion.objects.all().delete()
        Quiz.objects.all().delete()
        LessonStep.objects.all().delete()
        MapAction.objects.all().delete()
        Lesson.objects.all().delete()
        VietnamProvince.objects.all().delete()
        MapLayer.objects.all().delete()
        Enrollment.objects.all().delete()
        Classroom.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    def create_users(self):
        """Create sample users."""
        # Create superuser
        superuser = User.objects.create_superuser(
            email='admin@webgis.com',
            password='admin123',
            role='teacher'
        )

        # Create teacher
        teacher = User.objects.create_user(
            email='teacher@webgis.com',
            password='teacher123',
            role='teacher'
        )

        # Create students
        student1 = User.objects.create_user(
            email='student1@webgis.com',
            password='student123',
            role='student'
        )

        student2 = User.objects.create_user(
            email='student2@webgis.com',
            password='student123',
            role='student'
        )

        return {
            'superuser': superuser,
            'teacher': teacher,
            'student1': student1,
            'student2': student2
        }

    def create_classroom(self, teacher):
        """Create a sample classroom."""
        classroom = Classroom.objects.create(
            name='Địa lý Việt Nam 11',
            teacher=teacher
        )
        return classroom

    def enroll_students(self, classroom, students):
        """Enroll students in classroom."""
        for student in students:
            Enrollment.objects.create(
                student=student,
                classroom=classroom
            )

    def create_gis_data(self):
        """Create GIS layers and sample Vietnam province data."""
        # Create MapLayer
        layer = MapLayer.objects.create(
            name='Tỉnh thành Việt Nam',
            data_source_table='vietnam_provinces',
            geom_type='MULTIPOLYGON',
            description='Administrative boundaries of Vietnam provinces',
            is_active=True
        )

        # Create sample provinces with simplified geometries
        provinces_data = [
            {
                'name': 'Hà Nội',
                'name_en': 'Hanoi',
                'code': 'HN',
                'region': 'North',
                'population': 8053663,
                'area_km2': 3328.9,
                'coords': [
                    (105.7, 21.1), (105.9, 21.1), (105.9, 20.9),
                    (105.7, 20.9), (105.7, 21.1)
                ]
            },
            {
                'name': 'Hồ Chí Minh',
                'name_en': 'Ho Chi Minh City',
                'code': 'HCM',
                'region': 'South',
                'population': 8993082,
                'area_km2': 2061.0,
                'coords': [
                    (106.5, 10.9), (106.9, 10.9), (106.9, 10.5),
                    (106.5, 10.5), (106.5, 10.9)
                ]
            },
            {
                'name': 'Đà Nẵng',
                'name_en': 'Da Nang',
                'code': 'DN',
                'region': 'Central',
                'population': 1134310,
                'area_km2': 1285.4,
                'coords': [
                    (107.9, 16.2), (108.3, 16.2), (108.3, 15.8),
                    (107.9, 15.8), (107.9, 16.2)
                ]
            },
            {
                'name': 'Hải Phòng',
                'name_en': 'Hai Phong',
                'code': 'HP',
                'region': 'North',
                'population': 2028514,
                'area_km2': 1527.4,
                'coords': [
                    (106.5, 20.9), (106.9, 20.9), (106.9, 20.5),
                    (106.5, 20.5), (106.5, 20.9)
                ]
            },
            {
                'name': 'Cần Thơ',
                'name_en': 'Can Tho',
                'code': 'CT',
                'region': 'South',
                'population': 1282095,
                'area_km2': 1409.0,
                'coords': [
                    (105.5, 10.2), (105.9, 10.2), (105.9, 9.8),
                    (105.5, 9.8), (105.5, 10.2)
                ]
            },
        ]

        for data in provinces_data:
            polygon = Polygon(data['coords'])
            multipolygon = MultiPolygon(polygon, srid=4326)

            VietnamProvince.objects.create(
                name=data['name'],
                name_en=data['name_en'],
                code=data['code'],
                region=data['region'],
                population=data['population'],
                area_km2=data['area_km2'],
                geometry=multipolygon
            )

    def create_lesson(self):
        """Create an interactive lesson with steps."""
        lesson = Lesson.objects.create(
            title='Khám phá bản đồ Việt Nam',
            description='Bài học tương tác về các tỉnh thành Việt Nam'
        )

        # Step 1: Introduction
        action1 = MapAction.objects.create(
            action_type='ZOOM_TO',
            payload={'center': [106.0, 16.0], 'zoom': 6}
        )
        LessonStep.objects.create(
            lesson=lesson,
            order=1,
            popup_text='Chào mừng bạn đến với bài học về bản đồ Việt Nam! Hãy quan sát toàn cảnh đất nước.',
            map_action=action1
        )

        # Step 2: Show layer
        action2 = MapAction.objects.create(
            action_type='TOGGLE_LAYER',
            payload={'layer_id': 1, 'visible': True}
        )
        LessonStep.objects.create(
            lesson=lesson,
            order=2,
            popup_text='Đây là bản đồ hành chính Việt Nam với các tỉnh thành. Hãy xem các ranh giới tỉnh.',
            map_action=action2
        )

        # Step 3: Zoom to Hanoi
        action3 = MapAction.objects.create(
            action_type='ZOOM_TO',
            payload={'center': [105.8, 21.0], 'zoom': 10}
        )
        LessonStep.objects.create(
            lesson=lesson,
            order=3,
            popup_text='Đây là thủ đô Hà Nội - trung tâm chính trị của Việt Nam. Diện tích: 3,328.9 km².',
            map_action=action3
        )

    def create_quiz(self, classroom):
        """Create a sample quiz."""
        quiz = Quiz.objects.create(
            title='Kiểm tra kiến thức Địa lý Việt Nam',
            classroom=classroom,
            description='Bài kiểm tra về các tỉnh thành Việt Nam'
        )

        # Question 1
        q1 = QuizQuestion.objects.create(
            quiz=quiz,
            question_text='Thủ đô của Việt Nam là gì?',
            order=1
        )
        QuizAnswer.objects.create(question=q1, answer_text='Hồ Chí Minh', is_correct=False)
        QuizAnswer.objects.create(question=q1, answer_text='Hà Nội', is_correct=True)
        QuizAnswer.objects.create(question=q1, answer_text='Đà Nẵng', is_correct=False)
        QuizAnswer.objects.create(question=q1, answer_text='Hải Phòng', is_correct=False)

        # Question 2
        q2 = QuizQuestion.objects.create(
            quiz=quiz,
            question_text='Thành phố nào có dân số đông nhất Việt Nam?',
            order=2
        )
        QuizAnswer.objects.create(question=q2, answer_text='Hà Nội', is_correct=False)
        QuizAnswer.objects.create(question=q2, answer_text='Hồ Chí Minh', is_correct=True)
        QuizAnswer.objects.create(question=q2, answer_text='Đà Nẵng', is_correct=False)
        QuizAnswer.objects.create(question=q2, answer_text='Cần Thơ', is_correct=False)

        # Question 3
        q3 = QuizQuestion.objects.create(
            quiz=quiz,
            question_text='Thành phố nào nằm ở miền Trung Việt Nam?',
            order=3
        )
        QuizAnswer.objects.create(question=q3, answer_text='Hà Nội', is_correct=False)
        QuizAnswer.objects.create(question=q3, answer_text='Hồ Chí Minh', is_correct=False)
        QuizAnswer.objects.create(question=q3, answer_text='Đà Nẵng', is_correct=True)
        QuizAnswer.objects.create(question=q3, answer_text='Cần Thơ', is_correct=False)

    def print_summary(self, users, classroom):
        """Print summary of seeded data."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('SEEDED DATA SUMMARY'))
        self.stdout.write('='*50)

        self.stdout.write('\nUsers created:')
        self.stdout.write(f'  - Superuser: admin@webgis.com (password: admin123)')
        self.stdout.write(f'  - Teacher: teacher@webgis.com (password: teacher123)')
        self.stdout.write(f'  - Student 1: student1@webgis.com (password: student123)')
        self.stdout.write(f'  - Student 2: student2@webgis.com (password: student123)')

        self.stdout.write(f'\nClassroom: {classroom.name}')
        self.stdout.write(f'  - Enrollment code: {classroom.enrollment_code}')
        self.stdout.write(f'  - Enrolled students: {classroom.enrollments.count()}')

        self.stdout.write(f'\nGIS Data:')
        self.stdout.write(f'  - Map layers: {MapLayer.objects.count()}')
        self.stdout.write(f'  - Vietnam provinces: {VietnamProvince.objects.count()}')

        self.stdout.write(f'\nLessons: {Lesson.objects.count()}')
        self.stdout.write(f'  - Total steps: {LessonStep.objects.count()}')

        self.stdout.write(f'\nQuizzes: {Quiz.objects.count()}')
        self.stdout.write(f'  - Total questions: {QuizQuestion.objects.count()}')
        self.stdout.write(f'  - Total answers: {QuizAnswer.objects.count()}')

        self.stdout.write('\n' + '='*50 + '\n')
