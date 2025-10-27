"""
Script thêm dữ liệu CƠ BẢN (không cần GDAL/PostGIS)
Chạy: python add_data_simple.py
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

# Disable PostGIS temporarily
import django
from django.conf import settings

# Override database to use standard PostgreSQL (not PostGIS)
if not settings.configured:
    settings.configure(
        DEBUG=True,
        SECRET_KEY='temporary-key-for-adding-data',
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.postgresql',  # Not postgis!
                'NAME': 'webgis_db',
                'USER': 'postgres',
                'PASSWORD': 'postgres',
                'HOST': 'localhost',
                'PORT': '5432',
            }
        },
        INSTALLED_APPS=[
            'django.contrib.contenttypes',
            'django.contrib.auth',
            'apps.users',
            'apps.classrooms',
            'apps.lessons',
            'apps.quizzes',
        ],
        AUTH_USER_MODEL='users.User',
    )

django.setup()

from apps.users.models import User
from apps.classrooms.models import Classroom, Enrollment
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.quizzes.models import Quiz, QuizQuestion, QuizAnswer

def main():
    print("=" * 60)
    print(" THÊM DỮ LIỆU VÀO DATABASE (Simple - No GIS)")
    print("=" * 60)

    # 1. Tạo Users
    print("\n📝 1. Tạo Users...")
    try:
        admin = User.objects.create_superuser(
            email='admin@webgis.com',
            password='admin123',
            role='teacher'
        )
        print("   ✅ Admin: admin@webgis.com / admin123")
    except Exception as e:
        print(f"   ⚠️  Admin: {str(e)[:50]}")
        try:
            admin = User.objects.get(email='admin@webgis.com')
        except:
            admin = None

    try:
        teacher = User.objects.create_user(
            email='teacher@webgis.com',
            password='teacher123',
            role='teacher'
        )
        print("   ✅ Teacher: teacher@webgis.com / teacher123")
    except Exception as e:
        print(f"   ⚠️  Teacher: {str(e)[:50]}")
        try:
            teacher = User.objects.get(email='teacher@webgis.com')
        except:
            teacher = None

    try:
        student1 = User.objects.create_user(
            email='student1@webgis.com',
            password='student123',
            role='student'
        )
        print("   ✅ Student1: student1@webgis.com / student123")
    except Exception as e:
        print(f"   ⚠️  Student1: {str(e)[:50]}")
        try:
            student1 = User.objects.get(email='student1@webgis.com')
        except:
            student1 = None

    # 2. Tạo Classroom
    if teacher:
        print("\n📚 2. Tạo Classroom...")
        try:
            classroom, created = Classroom.objects.get_or_create(
                name='Địa lý Việt Nam 11',
                teacher=teacher
            )
            if created:
                print(f"   ✅ Classroom: {classroom.name}")
                print(f"   📋 Enrollment code: {classroom.enrollment_code}")
            else:
                print(f"   ⚠️  Classroom đã tồn tại: {classroom.name}")

            # 3. Enroll student
            if student1:
                print("\n👥 3. Enroll Students...")
                try:
                    enrollment, created = Enrollment.objects.get_or_create(
                        student=student1,
                        classroom=classroom
                    )
                    if created:
                        print(f"   ✅ Enrolled {student1.email}")
                    else:
                        print(f"   ⚠️  Student đã enrolled")
                except Exception as e:
                    print(f"   ❌ Error: {e}")

            # 4. Tạo Lesson
            print("\n📖 4. Tạo Lesson...")
            try:
                lesson, created = Lesson.objects.get_or_create(
                    title='Khám phá bản đồ Việt Nam',
                    defaults={'description': 'Bài học tương tác về các tỉnh thành Việt Nam'}
                )
                if created:
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
                    print(f"   ✅ Lesson: {lesson.title}")
                else:
                    print(f"   ⚠️  Lesson đã tồn tại")
            except Exception as e:
                print(f"   ❌ Error: {e}")

            # 5. Tạo Quiz
            print("\n📝 5. Tạo Quiz...")
            try:
                quiz, created = Quiz.objects.get_or_create(
                    title='Kiểm tra kiến thức Địa lý Việt Nam',
                    classroom=classroom,
                    defaults={'description': 'Bài kiểm tra về các tỉnh thành Việt Nam'}
                )
                if created:
                    q1 = QuizQuestion.objects.create(
                        quiz=quiz,
                        question_text='Thủ đô của Việt Nam là gì?',
                        order=1
                    )
                    QuizAnswer.objects.create(question=q1, answer_text='Hà Nội', is_correct=True)
                    QuizAnswer.objects.create(question=q1, answer_text='Hồ Chí Minh', is_correct=False)
                    QuizAnswer.objects.create(question=q1, answer_text='Đà Nẵng', is_correct=False)
                    print(f"   ✅ Quiz: {quiz.title}")
                else:
                    print(f"   ⚠️  Quiz đã tồn tại")
            except Exception as e:
                print(f"   ❌ Error: {e}")

        except Exception as e:
            print(f"   ❌ Error creating classroom: {e}")

    print("\n" + "=" * 60)
    print(" ✅ HOÀN THÀNH!")
    print("=" * 60)
    print("\n📊 THỐNG KÊ:")
    print(f"   Users: {User.objects.count()}")
    print(f"   Classrooms: {Classroom.objects.count()}")
    print(f"   Enrollments: {Enrollment.objects.count()}")
    print(f"   Lessons: {Lesson.objects.count()}")
    print(f"   Quizzes: {Quiz.objects.count()}")

    print("\n🔐 ĐĂNG NHẬP:")
    print("   Django Admin: http://localhost:8000/admin/")
    print("   Email: admin@webgis.com")
    print("   Password: admin123")

    print("\n⚠️  LƯU Ý: Dữ liệu GIS (provinces with geometry) cần Docker hoặc GDAL")

if __name__ == '__main__':
    main()
