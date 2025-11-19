"""
Script to create sample lessons for testing the grade filter feature.
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lessons.models import Lesson

# Sample lessons data
sample_lessons = [
    # Lớp 10
    {
        'title': 'Giới thiệu về GIS',
        'description': 'Tìm hiểu khái niệm cơ bản về Hệ thống thông tin địa lý (GIS) và ứng dụng trong đời sống',
        'grade': '10',
        'difficulty': 'Beginner',
        'duration': '30 phút',
        'icon': 'Globe',
    },
    {
        'title': 'Đọc bản đồ địa hình',
        'description': 'Học cách đọc và hiểu các ký hiệu, đường đồng mức trên bản đồ địa hình',
        'grade': '10',
        'difficulty': 'Beginner',
        'duration': '45 phút',
        'icon': 'Map',
    },
    {
        'title': 'Tọa độ địa lý',
        'description': 'Tìm hiểu về hệ thống tọa độ địa lý, kinh độ và vĩ độ',
        'grade': '10',
        'difficulty': 'Intermediate',
        'duration': '40 phút',
        'icon': 'Target',
    },

    # Lớp 11
    {
        'title': 'Phân tích dữ liệu không gian',
        'description': 'Ứng dụng GIS trong phân tích dữ liệu không gian và ra quyết định',
        'grade': '11',
        'difficulty': 'Intermediate',
        'duration': '50 phút',
        'icon': 'MapPin',
    },
    {
        'title': 'Bản đồ chuyên đề',
        'description': 'Tạo và phân tích các loại bản đồ chuyên đề: dân số, kinh tế, tự nhiên',
        'grade': '11',
        'difficulty': 'Intermediate',
        'duration': '1 giờ',
        'icon': 'Map',
    },
    {
        'title': 'Viễn thám và ứng dụng',
        'description': 'Tìm hiểu về công nghệ viễn thám và ứng dụng trong quan trắc môi trường',
        'grade': '11',
        'difficulty': 'Advanced',
        'duration': '1 giờ 15 phút',
        'icon': 'Globe',
    },

    # Lớp 12
    {
        'title': 'GIS trong quy hoạch đô thị',
        'description': 'Ứng dụng GIS trong quy hoạch và phát triển đô thị bền vững',
        'grade': '12',
        'difficulty': 'Advanced',
        'duration': '1 giờ',
        'icon': 'Target',
    },
    {
        'title': 'Phân tích đa tiêu chí',
        'description': 'Kỹ thuật phân tích đa tiêu chí trong GIS để hỗ trợ ra quyết định',
        'grade': '12',
        'difficulty': 'Advanced',
        'duration': '1 giờ 30 phút',
        'icon': 'MapPin',
    },
    {
        'title': 'Dự án GIS thực tế',
        'description': 'Thực hiện dự án GIS hoàn chỉnh từ thu thập dữ liệu đến trình bày kết quả',
        'grade': '12',
        'difficulty': 'Advanced',
        'duration': '2 giờ',
        'icon': 'BookOpen',
    },
]

def create_lessons():
    """Create sample lessons in the database."""
    print('🚀 Creating sample lessons...\n')

    created_count = 0
    updated_count = 0

    for lesson_data in sample_lessons:
        # Check if lesson already exists
        lesson, created = Lesson.objects.get_or_create(
            title=lesson_data['title'],
            defaults=lesson_data
        )

        if created:
            print(f'✅ Created: {lesson.title} (Lớp {lesson.grade}, {lesson.difficulty})')
            created_count += 1
        else:
            # Update existing lesson
            for key, value in lesson_data.items():
                setattr(lesson, key, value)
            lesson.save()
            print(f'🔄 Updated: {lesson.title} (Lớp {lesson.grade}, {lesson.difficulty})')
            updated_count += 1

    print(f'\n📊 Summary:')
    print(f'   - Created: {created_count} lessons')
    print(f'   - Updated: {updated_count} lessons')
    print(f'   - Total: {Lesson.objects.count()} lessons in database')

    # Show breakdown by grade
    print(f'\n📚 Breakdown by grade:')
    for grade in ['10', '11', '12']:
        count = Lesson.objects.filter(grade=grade).count()
        print(f'   - Lớp {grade}: {count} lessons')

if __name__ == '__main__':
    create_lessons()
