"""
Seed curated Địa lí 10 - Cánh Diều - Học kì 1 content.
"""
from datetime import timedelta
import json
from pathlib import Path

from django.contrib.gis.geos import GEOSGeometry, LineString, MultiPolygon, Point, Polygon
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.classrooms.models import Assignment, Classroom, Enrollment
from apps.gis_data.models import Boundary, LineFeature, MapLayer, PointOfInterest, PolygonFeature, Route, VietnamProvince
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.quizzes.models import Quiz, QuizAnswer, QuizQuestion
from apps.users.models import User


CURRICULUM = {
    'subject': 'Địa lí',
    'grade_level': '10',
    'semester': '1',
    'textbook_series': 'canh-dieu',
    'school': 'THPT',
}

MODULES = [
    {
        'code': 'module-01',
        'title': 'Bản đồ, GPS, bản đồ số và phương pháp biểu hiện đối tượng địa lí',
        'center': [106.2, 16.2],
        'zoom': 4.6,
        'layers': [
            ('Ranh giới tỉnh, thành Việt Nam', 'vietnam_provinces', 'MULTIPOLYGON', None, None),
            ('Điểm dân cư và đô thị mẫu', 'points_of_interest', 'POINT', 'category', 'module_01_city'),
            ('Tuyến giao thông minh họa', 'line_features', 'LINESTRING', 'category', 'module_01_route'),
            ('Vùng biểu hiện theo diện tích', 'polygon_features', 'POLYGON', 'category', 'module_01_region'),
        ],
        'overview': 'Nhận biết thành phần cơ bản của bản đồ, vai trò của GPS và bản đồ số, cùng các cách biểu hiện điểm, đường, vùng trên bản đồ.',
        'practice': 'Quan sát cùng lúc lớp điểm, lớp tuyến và lớp vùng để phân biệt cách thể hiện đối tượng địa lí trên WebGIS.',
        'steps': [
            'Xác định tên lớp, chú giải và phạm vi quan sát chính của module 01.',
            'So sánh lớp điểm, lớp tuyến và lớp vùng để nhận ra mỗi loại dữ liệu phù hợp với dạng đối tượng nào.',
            'Bật toàn bộ layer pack module 01 rồi ghi lại ví dụ về đối tượng điểm, đường và vùng mà em quan sát được.',
        ],
        'questions': [
            ('Phương pháp kí hiệu phù hợp nhất để thể hiện cảng biển là gì?', ['Phương pháp kí hiệu', 'Phương pháp đường chuyển động', 'Phương pháp chấm điểm', 'Phương pháp bản đồ - biểu đồ'], 0),
            ('Nếu muốn thể hiện mạng lưới giao thông, lớp dữ liệu nào phù hợp nhất?', ['Điểm', 'Đường', 'Vùng', 'Bảng số liệu'], 1),
            ('Chú giải bản đồ dùng để làm gì?', ['Chỉ hướng Bắc', 'Giải thích kí hiệu và màu sắc', 'Đo nhiệt độ', 'Tính dân số'], 1),
            ('Tỉ lệ bản đồ cho biết điều gì?', ['Khoảng cách thật và khoảng cách trên bản đồ', 'Lượng mưa trung bình năm', 'Độ dốc địa hình', 'Số dân đô thị'], 0),
            ('Bản đồ số giúp học sinh làm gì thuận tiện hơn?', ['Quan sát, bật tắt lớp và phóng to thu nhỏ', 'Làm thí nghiệm hóa học', 'Đo nhịp tim', 'Thay sách giáo khoa'], 0),
            ('GPS thường được dùng để xác định điều gì?', ['Vị trí', 'Độ mặn', 'Loại đất', 'Dân số'], 0),
            ('Đối tượng phân bố theo diện rộng thường hợp với cách biểu hiện nào?', ['Kí hiệu điểm', 'Khoanh vùng', 'Biểu đồ tròn tại điểm', 'Đường chuyển động'], 1),
            ('Khi nhìn lớp vùng trong module 01, em đang luyện kĩ năng nào?', ['Phân biệt phân bố theo diện tích', 'Tính tốc độ gió', 'Đọc múi giờ', 'Xác định độ cao tuyệt đối'], 0),
        ],
    },
    {
        'code': 'module-02',
        'title': 'Trái Đất, kinh vĩ tuyến, múi giờ và hệ quả chuyển động',
        'center': [30, 15],
        'zoom': 1.8,
        'layers': [
            ('Đường kinh vĩ tuyến tiêu biểu', 'line_features', 'LINESTRING', 'category', 'module_02_reference_lines'),
            ('Múi giờ minh họa', 'polygon_features', 'POLYGON', 'category', 'module_02_timezone'),
            ('Điểm bài tập tọa độ', 'points_of_interest', 'POINT', 'category', 'module_02_coordinate'),
        ],
        'overview': 'Ôn cách xác định kinh tuyến, vĩ tuyến, múi giờ và hiểu hệ quả chính của chuyển động tự quay quanh trục và chuyển động quanh Mặt Trời.',
        'practice': 'Dùng WebGIS để nhận diện xích đạo, chí tuyến, múi giờ và đọc nhanh tọa độ của các điểm mẫu.',
        'steps': [
            'Xác định xích đạo, chí tuyến và kinh tuyến gốc trên bản đồ thế giới.',
            'Bật lớp múi giờ để so sánh vị trí của Việt Nam với các khu vực khác.',
            'Mở lớp điểm tọa độ và luyện đọc kinh độ, vĩ độ của từng điểm.',
        ],
        'questions': [
            ('Kinh tuyến gốc đi qua địa điểm nào?', ['Greenwich', 'Hà Nội', 'Tokyo', 'Paris'], 0),
            ('Xích đạo là đường gì?', ['Kinh tuyến 0 độ', 'Vĩ tuyến 0 độ', 'Chí tuyến Bắc', 'Vòng cực Bắc'], 1),
            ('Một múi giờ chuẩn rộng khoảng bao nhiêu kinh độ?', ['10 độ', '12 độ', '15 độ', '24 độ'], 2),
            ('Việt Nam thuộc múi giờ nào?', ['UTC+5', 'UTC+6', 'UTC+7', 'UTC+8'], 2),
            ('Hệ quả rõ nhất của Trái Đất tự quay quanh trục là gì?', ['Luân phiên ngày đêm', 'Động đất', 'Mưa đá', 'Núi lửa'], 0),
            ('Nếu đi từ tây sang đông, giờ địa phương thường thay đổi thế nào?', ['Sớm hơn', 'Muộn hơn', 'Không đổi', 'Đảo ngược ngẫu nhiên'], 0),
            ('Chí tuyến Bắc nằm gần vĩ độ nào?', ['0 độ', '23 độ 27 phút Bắc', '45 độ Bắc', '66 độ 33 phút Bắc'], 1),
            ('Lớp điểm tọa độ trong module 02 giúp rèn kĩ năng gì?', ['Đọc và xác định tọa độ địa lí', 'Phân loại đất', 'Nhận biết lưu vực sông', 'Tính độ mặn biển'], 0),
        ],
    },
    {
        'code': 'module-03',
        'title': 'Thạch quyển, kiến tạo mảng, nội lực và ngoại lực',
        'center': [105, 12],
        'zoom': 2.3,
        'layers': [
            ('Ranh giới mảng kiến tạo', 'line_features', 'LINESTRING', 'category', 'module_03_plate_boundary'),
            ('Điểm núi lửa và động đất mẫu', 'points_of_interest', 'POINT', 'category', 'module_03_hazard_point'),
            ('Dạng địa hình minh họa', 'polygon_features', 'POLYGON', 'category', 'module_03_landform'),
        ],
        'overview': 'Nhận biết vai trò của thạch quyển, quy luật phân bố mảng kiến tạo và tác động của nội lực, ngoại lực đến bề mặt Trái Đất.',
        'practice': 'Quan sát ranh giới mảng, điểm nguy cơ và dạng địa hình để liên hệ giữa vận động kiến tạo và địa hình bề mặt.',
        'steps': [
            'Quan sát đường ranh giới mảng để nhận ra nơi thường tập trung hoạt động kiến tạo mạnh.',
            'Đối chiếu các điểm núi lửa, động đất với ranh giới mảng trên bản đồ.',
            'Bật lớp dạng địa hình và nêu ví dụ về tác động của nội lực hoặc ngoại lực.',
        ],
        'questions': [
            ('Mảng kiến tạo là gì?', ['Khối lớn của thạch quyển đang dịch chuyển', 'Một loại đất', 'Một đới khí hậu', 'Một dòng biển'], 0),
            ('Động đất và núi lửa thường tập trung nhiều ở đâu?', ['Ven ranh giới mảng', 'Giữa sa mạc', 'Trung tâm đồng bằng lớn', 'Trên mọi nơi như nhau'], 0),
            ('Nội lực chủ yếu tạo ra tác động nào?', ['Nâng lên, uốn nếp, đứt gãy', 'Làm mát khí quyển', 'Tăng độ mặn biển', 'Tạo mưa nhân tạo'], 0),
            ('Ngoại lực bao gồm quá trình nào?', ['Phong hóa, xâm thực, bồi tụ', 'Phóng xạ mặt trời', 'Sinh sản của sinh vật', 'Quang hợp'], 0),
            ('Địa hình núi trẻ thường liên quan nhiều đến quá trình nào?', ['Vận động kiến tạo mạnh', 'Lắng đọng phù sa yên tĩnh', 'Bốc hơi nước', 'Chuyển động biểu kiến của Mặt Trời'], 0),
            ('Khi quan sát lớp địa hình minh họa, em đang luyện kĩ năng gì?', ['Liên hệ quá trình tạo hình với dạng địa hình', 'Đọc múi giờ', 'Tính tỉ lệ dân số', 'Xác định loại gió mùa'], 0),
            ('Nội lực và ngoại lực có quan hệ thế nào?', ['Cùng tác động làm biến đổi bề mặt Trái Đất', 'Hoàn toàn không liên quan', 'Chỉ có nội lực mới quan trọng', 'Chỉ có ngoại lực mới quan trọng'], 0),
            ('Ví dụ nào sau đây gần với ngoại lực?', ['Bồi tụ ở cửa sông', 'Nâng tạo núi', 'Phun trào magma', 'Đứt gãy kiến tạo'], 0),
        ],
    },
    {
        'code': 'module-04',
        'title': 'Khí quyển, nhiệt độ, khí áp, gió và mưa',
        'center': [95, 18],
        'zoom': 2.2,
        'layers': [
            ('Đai khí áp và gió chính', 'line_features', 'LINESTRING', 'category', 'module_04_wind_belt'),
            ('Trạm khí tượng mẫu', 'points_of_interest', 'POINT', 'category', 'module_04_climate_station'),
            ('Miền khí hậu minh họa', 'polygon_features', 'POLYGON', 'category', 'module_04_climate_zone'),
        ],
        'overview': 'Củng cố kiến thức về cấu trúc khí quyển, sự phân bố nhiệt độ, khí áp, các đai gió chính và nhân tố tạo mưa.',
        'practice': 'Dùng WebGIS để so sánh trạm khí tượng, đai gió và miền khí hậu khi trả lời các câu hỏi cuối bài.',
        'steps': [
            'Quan sát các đai gió chính để ghi nhớ hướng chuyển động phổ biến của không khí.',
            'Mở các trạm khí tượng mẫu và so sánh thông tin nhiệt độ, lượng mưa giữa các vị trí.',
            'Bật lớp miền khí hậu để liên hệ giữa gió, mưa và sự khác biệt khí hậu.',
        ],
        'questions': [
            ('Khí áp là gì?', ['Sức ép của không khí lên bề mặt Trái Đất', 'Độ mặn của nước biển', 'Độ dày của đất', 'Lượng phù sa'], 0),
            ('Gió hình thành chủ yếu do sự chênh lệch nào?', ['Khí áp', 'Dân số', 'Độ che phủ rừng', 'Số giờ học'], 0),
            ('Mưa địa hình thường xuất hiện khi nào?', ['Không khí ẩm bị đẩy lên sườn núi', 'Biển lặng sóng', 'Áp cao mạnh lên', 'Trời quang hoàn toàn'], 0),
            ('Đai áp thấp xích đạo thường gắn với đặc điểm nào?', ['Không khí bốc lên mạnh', 'Khô hạn quanh năm', 'Băng tuyết vĩnh cửu', 'Gió tây ôn đới suy yếu hoàn toàn'], 0),
            ('Trạm khí tượng giúp học sinh quan sát tốt nhất dữ liệu nào?', ['Nhiệt độ và lượng mưa', 'Đứt gãy địa chất', 'Loại đất', 'Động đất sâu'], 0),
            ('Miền khí hậu thường được biểu hiện thuận tiện bằng lớp nào?', ['Lớp vùng', 'Lớp điểm đơn lẻ', 'Lớp bảng thuần văn bản', 'Lớp ảnh không định vị'], 0),
            ('Gió thổi từ nơi nào đến nơi nào?', ['Từ nơi khí áp cao đến nơi khí áp thấp', 'Từ biển vào rừng mọi lúc', 'Từ nơi nóng hơn đến nơi lạnh hơn bất kể áp suất', 'Ngẫu nhiên'], 0),
            ('Khi đối chiếu trạm khí tượng và miền khí hậu, em đang luyện kĩ năng gì?', ['Liên hệ số liệu điểm với vùng phân hóa khí hậu', 'Đọc múi giờ', 'Nhận dạng mảng kiến tạo', 'Tính chiều dài sông'], 0),
        ],
    },
    {
        'code': 'module-05',
        'title': 'Thủy quyển, nước trên lục địa, nước biển và đại dương',
        'center': [107.5, 15.5],
        'zoom': 4.0,
        'layers': [
            ('Sông chính minh họa', 'routes', 'LINESTRING', 'type', 'module_05_river'),
            ('Lưu vực sông mẫu', 'boundaries', 'MULTIPOLYGON', 'type', 'module_05_basin'),
            ('Trạm thủy văn mẫu', 'points_of_interest', 'POINT', 'category', 'module_05_hydro_station'),
            ('Vùng biển và đại dương minh họa', 'polygon_features', 'POLYGON', 'category', 'module_05_sea_region'),
        ],
        'overview': 'Nắm được các thành phần chính của thủy quyển, đặc điểm nước trên lục địa và một số biểu hiện cơ bản của môi trường biển - đại dương.',
        'practice': 'Từ lưu vực, tuyến sông và trạm thủy văn, học sinh luyện quan sát chế độ nước sông và mối liên hệ với không gian lưu vực.',
        'steps': [
            'Bật lớp sông chính để nhận ra hướng chảy và mạng lưới sông tiêu biểu.',
            'Mở lớp lưu vực sông và xác định phạm vi thu nước của từng hệ thống.',
            'Quan sát trạm thủy văn, sau đó liên hệ với lớp vùng biển để trả lời câu hỏi ngắn cuối bài.',
        ],
        'questions': [
            ('Lưu vực sông là gì?', ['Phần diện tích cung cấp nước cho một con sông', 'Một đoạn sông có nhiều thác', 'Nơi tàu thuyền neo đậu', 'Vùng có nhiều ao hồ'], 0),
            ('Chế độ nước sông chịu ảnh hưởng mạnh của yếu tố nào?', ['Mưa theo mùa và nguồn cấp nước', 'Màu đất', 'Tên địa phương', 'Múi giờ'], 0),
            ('Trạm thủy văn giúp theo dõi nội dung nào?', ['Mực nước và lưu lượng', 'Số lượng động đất', 'Độ nghiêng trục Trái Đất', 'Hướng gió tầng cao'], 0),
            ('Nước biển và đại dương khác nước trên lục địa rõ nhất ở đặc điểm nào?', ['Độ mặn', 'Nhiệt độ luôn thấp', 'Không có sinh vật', 'Không chịu tác động của gió'], 0),
            ('Nếu quan sát lớp tuyến sông và lớp lưu vực cùng lúc, em dễ nhận ra điều gì?', ['Quan hệ giữa dòng chảy và phạm vi thu nước', 'Múi giờ địa phương', 'Sự phân bố đất feralit', 'Vị trí chí tuyến'], 0),
            ('Ví dụ nào thuộc nước trên lục địa?', ['Sông, hồ, băng hà, nước ngầm', 'Biển Đông', 'Thái Bình Dương', 'Vịnh Bắc Bộ'], 0),
            ('Nước biển tham gia mạnh vào vòng tuần hoàn nước qua quá trình nào?', ['Bốc hơi', 'Uốn nếp địa hình', 'Đứt gãy', 'Phong hóa cơ học'], 0),
            ('Lớp vùng biển trong module 05 giúp học sinh làm gì?', ['Liên hệ giữa không gian biển và thủy quyển', 'Đọc tọa độ núi lửa', 'Tính dân số', 'Quan sát đai áp cao'], 0),
        ],
    },
    {
        'code': 'module-06',
        'title': 'Thổ nhưỡng, sinh quyển, vỏ địa lí, quy luật địa đới và phi địa đới',
        'center': [106.5, 16.0],
        'zoom': 3.8,
        'layers': [
            ('Đới đất minh họa', 'polygon_features', 'POLYGON', 'category', 'module_06_soil_zone'),
            ('Đới sinh vật minh họa', 'polygon_features', 'POLYGON', 'category', 'module_06_biome_zone'),
            ('Điểm hệ sinh thái mẫu', 'points_of_interest', 'POINT', 'category', 'module_06_ecosystem_point'),
        ],
        'overview': 'Khái quát mối quan hệ giữa đất, sinh vật và các thành phần tự nhiên trong vỏ địa lí; bước đầu nhận biết quy luật địa đới và phi địa đới.',
        'practice': 'So sánh lớp đất, lớp sinh vật và điểm hệ sinh thái để thấy sự phân hóa theo đới và theo điều kiện địa phương.',
        'steps': [
            'Mở lớp đới đất và nhận ra sự khác nhau giữa các vùng đất minh họa.',
            'Bật lớp đới sinh vật để đối chiếu với lớp đất và điều kiện môi trường.',
            'Quan sát các điểm hệ sinh thái rồi nêu ví dụ về biểu hiện địa đới hoặc phi địa đới.',
        ],
        'questions': [
            ('Thổ nhưỡng là gì?', ['Lớp đất trên bề mặt lục địa', 'Một dạng mưa', 'Một loại đá magma', 'Một dòng biển'], 0),
            ('Sinh quyển bao gồm gì?', ['Toàn bộ sinh vật và môi trường sống của chúng', 'Chỉ động vật trên cạn', 'Chỉ thực vật rừng', 'Chỉ vi khuẩn trong đất'], 0),
            ('Quy luật địa đới gắn chủ yếu với sự thay đổi theo yếu tố nào?', ['Vĩ độ', 'Kinh độ', 'Tên địa phương', 'Múi giờ'], 0),
            ('Quy luật phi địa đới thường gắn với yếu tố nào?', ['Độ cao và địa hình', 'Vĩ độ là yếu tố duy nhất', 'Chu kì ngày đêm', 'Dòng chảy sông'], 0),
            ('Khi so sánh lớp đất và lớp sinh vật, học sinh đang luyện kĩ năng gì?', ['Nhận ra mối liên hệ giữa các thành phần tự nhiên', 'Đọc tọa độ địa lí', 'Xác định hướng gió mùa', 'Tính khoảng cách bản đồ'], 0),
            ('Ví dụ nào gần với biểu hiện phi địa đới?', ['Khác biệt sinh vật theo đai cao trên núi', 'Phân hóa từ xích đạo về cực', 'Sự thay đổi thời gian theo múi giờ', 'Sự luân phiên ngày đêm'], 0),
            ('Vỏ địa lí được hiểu khái quát là gì?', ['Lớp vỏ nơi các thành phần tự nhiên tác động qua lại chặt chẽ', 'Lõi Trái Đất', 'Một mảng kiến tạo đơn lẻ', 'Khí quyển tầng cao'], 0),
            ('Điểm hệ sinh thái mẫu trong module 06 có ích nhất cho hoạt động nào?', ['Liên hệ kiến thức tự nhiên với ví dụ cụ thể trên bản đồ', 'Xác định đường đứt gãy', 'Đọc múi giờ chuẩn', 'Theo dõi mực nước sông'], 0),
        ],
    },
]

CURATED_CLASSROOM_NAME = 'Địa lí 10 - Cánh Diều - HK1'


class Command(BaseCommand):
    help = 'Seed curated Địa lí 10 - Cánh Diều - Học kì 1 content for WebGIS.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.ensure_sample_geometries()
        teacher = self.get_demo_teacher()
        classroom = self.upsert_classroom(teacher)
        self.enroll_demo_students(classroom)

        curated_lessons = []
        curated_quizzes = []
        curated_assignments = []

        for module in MODULES:
            layers = self.upsert_layers(module)
            overview = self.upsert_lesson(module, 'overview', layers)
            practice = self.upsert_lesson(module, 'practice', layers)
            quiz = self.upsert_quiz(module, practice, classroom)
            curated_lessons.extend([overview.id, practice.id])
            curated_quizzes.append(quiz.id)
            curated_assignments.extend(self.upsert_assignments(classroom, module, practice, quiz))

        self.cleanup_legacy_content(classroom, curated_lessons, curated_quizzes, curated_assignments)
        self.stdout.write(self.style.SUCCESS('Seeded curated grade 10 HK1 content with 6 modules.'))

    def get_demo_teacher(self):
        teacher = User.objects.filter(email='teacher01@webgis.com').first()
        if not teacher:
            teacher = User.objects.filter(role='teacher').order_by('id').first()
        if not teacher:
            raise RuntimeError('No teacher account found. Create a teacher before seeding HK1 content.')
        return teacher

    def upsert_classroom(self, teacher):
        classroom, _ = Classroom.objects.update_or_create(
            teacher=teacher,
            name=CURATED_CLASSROOM_NAME,
            defaults={
                'subject': CURRICULUM['subject'],
                'grade_level': CURRICULUM['grade_level'],
                'semester': CURRICULUM['semester'],
                'textbook_series': CURRICULUM['textbook_series'],
                'module_code': '',
                'is_published': True,
            },
        )
        return classroom

    def enroll_demo_students(self, classroom):
        for student in User.objects.filter(role='student').order_by('id'):
            Enrollment.objects.get_or_create(classroom=classroom, student=student)

    def ensure_sample_geometries(self):
        self.ensure_public_grade10_geometries()
        self.ensure_points()
        self.ensure_lines()
        self.ensure_polygons()
        self.ensure_boundaries_and_routes()

    def ensure_public_grade10_geometries(self):
        self.ensure_public_provinces()
        self.ensure_public_points('module_01_city', 'public_grade10/processed/module01_cities.geojson')
        self.ensure_public_points('module_05_hydro_station', 'public_grade10/processed/module05_points.geojson')
        self.ensure_public_lines('module_01_route', 'public_grade10/processed/module01_roads.geojson')
        self.ensure_public_polygons('module_01_region', 'public_grade10/processed/module01_regions.geojson')
        self.ensure_public_routes('module_05_river', 'public_grade10/processed/module05_rivers.geojson')
        self.ensure_public_boundaries('module_05_basin', 'public_grade10/processed/module05_basins.geojson')
        self.ensure_public_polygons('module_05_sea_region', 'public_grade10/processed/module05_marine.geojson')
        self.ensure_public_polygons('module_06_biome_zone', 'public_grade10/processed/module06_regions.geojson')

    def sample_data_path(self, relative_path):
        return Path(__file__).resolve().parents[4] / 'sample_data' / relative_path

    def load_geojson_features(self, relative_path):
        path = self.sample_data_path(relative_path)
        if not path.exists():
            return []
        return json.loads(path.read_text(encoding='utf-8')).get('features', [])

    def to_point_geometry(self, geometry):
        geom = GEOSGeometry(json.dumps(geometry), srid=4326)
        return geom if geom.geom_type == 'Point' else None

    def to_line_geometry(self, geometry):
        geom = GEOSGeometry(json.dumps(geometry), srid=4326)
        if geom.geom_type == 'MultiLineString':
            geom = max(list(geom), key=lambda item: item.length)
        return geom if geom.geom_type == 'LineString' else None

    def to_polygon_geometry(self, geometry):
        geom = GEOSGeometry(json.dumps(geometry), srid=4326)
        if geom.geom_type == 'MultiPolygon':
            geom = max(list(geom), key=lambda item: item.area)
        return geom if geom.geom_type == 'Polygon' else None

    def to_multipolygon_geometry(self, geometry):
        geom = GEOSGeometry(json.dumps(geometry), srid=4326)
        if geom.geom_type == 'Polygon':
            return MultiPolygon(geom, srid=4326)
        return geom if geom.geom_type == 'MultiPolygon' else None

    def ensure_public_provinces(self):
        features = self.load_geojson_features('vietnam_provinces.geojson')
        if not features:
            return
        seen_codes = []
        for feature in features:
            props = feature.get('properties', {})
            code = props.get('code') or props.get('name')
            geometry = self.to_multipolygon_geometry(feature.get('geometry'))
            if not geometry:
                continue
            seen_codes.append(code)
            VietnamProvince.objects.update_or_create(
                code=code,
                defaults={
                    'name': props.get('name', code),
                    'name_en': props.get('name', props.get('name_en', code)),
                    'region': props.get('region', 'Vi?t Nam'),
                    'population': int(float(props.get('population', 0) or 0)),
                    'area_km2': float(props.get('area_km2', 0) or 0),
                    'geometry': geometry,
                },
            )
        VietnamProvince.objects.exclude(code__in=seen_codes).delete()

    def ensure_public_points(self, category, relative_path):
        features = self.load_geojson_features(relative_path)
        if not features:
            return
        names = []
        for feature in features:
            props = feature.get('properties', {})
            geometry = self.to_point_geometry(feature.get('geometry'))
            if not geometry:
                continue
            name = props.get('name') or f'{category}-{len(names)+1}'
            names.append(name)
            PointOfInterest.objects.update_or_create(
                name=name,
                category=category,
                defaults={
                    'description': props.get('description', ''),
                    'geometry': geometry,
                },
            )
        PointOfInterest.objects.filter(category=category).exclude(name__in=names).delete()

    def ensure_public_lines(self, category, relative_path):
        features = self.load_geojson_features(relative_path)
        if not features:
            return
        names = []
        for feature in features:
            props = feature.get('properties', {})
            geometry = self.to_line_geometry(feature.get('geometry'))
            if not geometry:
                continue
            name = props.get('name') or f'{category}-{len(names)+1}'
            names.append(name)
            LineFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={
                    'description': props.get('description', ''),
                    'geometry': geometry,
                },
            )
        LineFeature.objects.filter(category=category).exclude(name__in=names).delete()

    def ensure_public_polygons(self, category, relative_path):
        features = self.load_geojson_features(relative_path)
        if not features:
            return
        names = []
        for feature in features:
            props = feature.get('properties', {})
            geometry = self.to_polygon_geometry(feature.get('geometry'))
            if not geometry:
                continue
            name = props.get('name') or f'{category}-{len(names)+1}'
            names.append(name)
            PolygonFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={
                    'description': props.get('description', ''),
                    'geometry': geometry,
                },
            )
        PolygonFeature.objects.filter(category=category).exclude(name__in=names).delete()

    def ensure_public_routes(self, route_type, relative_path):
        features = self.load_geojson_features(relative_path)
        if not features:
            return
        names = []
        for feature in features:
            props = feature.get('properties', {})
            geometry = self.to_line_geometry(feature.get('geometry'))
            if not geometry:
                continue
            name = props.get('name') or f'{route_type}-{len(names)+1}'
            names.append(name)
            Route.objects.update_or_create(
                name=name,
                type=route_type,
                defaults={
                    'length_km': float(props.get('length_km', 0) or 0),
                    'geometry': geometry,
                },
            )
        Route.objects.filter(type=route_type).exclude(name__in=names).delete()

    def ensure_public_boundaries(self, boundary_type, relative_path):
        features = self.load_geojson_features(relative_path)
        if not features:
            return
        names = []
        for feature in features:
            props = feature.get('properties', {})
            geometry = self.to_multipolygon_geometry(feature.get('geometry'))
            if not geometry:
                continue
            name = props.get('name') or f'{boundary_type}-{len(names)+1}'
            names.append(name)
            Boundary.objects.update_or_create(
                name=name,
                type=boundary_type,
                defaults={
                    'code': props.get('code', ''),
                    'area_km2': float(props.get('area_km2', 0) or 0),
                    'geometry': geometry,
                },
            )
        Boundary.objects.filter(type=boundary_type).exclude(name__in=names).delete()

    def ensure_points(self):
        points = [
            ('?i?m A', 'module_02_coordinate', 'M?u ??c t?a ?? g?n x?ch ??o', Point(30, 2, srid=4326)),
            ('?i?m B', 'module_02_coordinate', 'M?u ??c t?a ?? ? B?c b?n c?u', Point(105, 21, srid=4326)),
            ('?i?m C', 'module_02_coordinate', 'M?u ??c t?a ?? ? Nam b?n c?u', Point(-60, -15, srid=4326)),
            ('V?nh ?ai l?a m?u', 'module_03_hazard_point', '?i?m n?i l?a minh h?a', Point(138, 36, srid=4326)),
            ('??ng ??t m?u', 'module_03_hazard_point', '?i?m ??ng ??t minh h?a', Point(142, 38, srid=4326)),
            ('H? N?i kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n B?c', Point(105.84, 21.03, srid=4326)),
            ('Hu? kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n Trung', Point(107.58, 16.46, srid=4326)),
            ('C?n Th? kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n Nam', Point(105.78, 10.03, srid=4326)),
            ('R?ng ng?p m?n C? Mau', 'module_06_ecosystem_point', 'H? sinh th?i ven bi?n', Point(105.15, 8.75, srid=4326)),
            ('V??n qu?c gia C?c Ph??ng', 'module_06_ecosystem_point', 'H? sinh th?i r?ng nhi?t ??i', Point(105.61, 20.35, srid=4326)),
            ('V??n qu?c gia Yok ??n', 'module_06_ecosystem_point', 'H? sinh th?i r?ng kh?p T?y Nguy?n', Point(107.716, 12.862, srid=4326)),
        ]
        for name, category, description, geometry in points:
            PointOfInterest.objects.update_or_create(name=name, category=category, defaults={'description': description, 'geometry': geometry})

    def ensure_lines(self):
        lines = [
            ('X?ch ??o', 'module_02_latitude_line', '???ng v? tuy?n 0?', [(-180, 0), (180, 0)]),
            ('Kinh tuy?n g?c', 'module_02_longitude_line', '???ng kinh tuy?n 0?', [(0, -80), (0, 80)]),
            ('Ch? tuy?n B?c', 'module_02_latitude_line', 'V? tuy?n 23,5?B', [(-180, 23.5), (180, 23.5)]),
            ('Ch? tuy?n Nam', 'module_02_latitude_line', 'V? tuy?n 23,5?N', [(-180, -23.5), (180, -23.5)]),
            ('V?ng c?c B?c', 'module_02_latitude_line', 'V? tuy?n 66,5?B', [(-180, 66.5), (180, 66.5)]),
            ('V?ng c?c Nam', 'module_02_latitude_line', 'V? tuy?n 66,5?N', [(-180, -66.5), (180, -66.5)]),
            ('Ranh gi?i m?ng minh h?a', 'module_03_plate_boundary', 'Ranh gi?i m?ng ki?n t?o ??n gi?n h?a', [(95, 8), (105, 18), (118, 30), (140, 38)]),
            ('?ai ?p th?p x?ch ??o', 'module_04_pressure_belt', 'D?i ?p th?p g?n x?ch ??o', [(-180, 5), (180, 5)]),
            ('Gi? t?n phong ??ng B?c', 'module_04_wind_belt', 'H??ng gi? ch? ??o ? b?n c?u B?c', [(115, 23), (105, 18), (95, 12)]),
            ('Gi? t?n phong ??ng Nam', 'module_04_wind_belt', 'H??ng gi? ch? ??o ? b?n c?u Nam', [(120, -18), (110, -10), (100, -2)]),
        ]
        for name, category, description, coords in lines:
            LineFeature.objects.update_or_create(name=name, category=category, defaults={'description': description, 'geometry': LineString(coords, srid=4326)})

    def ensure_polygons(self):
        polygons = [
            ('UTC+7 minh h?a', 'module_02_timezone', 'V?ng m?i gi? minh h?a', [(97.5, -10), (112.5, -10), (112.5, 35), (97.5, 35), (97.5, -10)]),
            ('Mi?n n?i tr?', 'module_03_landform', 'D?ng ??a h?nh ch?u t?c ??ng ki?n t?o', [(99, 29), (106, 29), (106, 23), (99, 23), (99, 29)]),
            ('??ng b?ng b?i t?', 'module_03_landform', 'D?ng ??a h?nh do ngo?i l?c', [(105, 11.5), (108, 11.5), (108, 9.5), (105, 9.5), (105, 11.5)]),
            ('Mi?n kh? h?u nhi?t ??i ?m', 'module_04_climate_zone', 'Mi?n kh? h?u minh h?a', [(101, 22), (110, 22), (110, 8), (101, 8), (101, 22)]),
            ('??t feralit', 'module_06_soil_zone', '??i ??t minh h?a theo n?n nhi?t ??i ?m', [(103.5, 21), (110.5, 21), (110.5, 11), (103.5, 11), (103.5, 21)]),
            ('??t ph? sa', 'module_06_soil_zone', '??i ??t minh h?a cho ??ng b?ng ch?u th?', [(105, 11), (107.2, 11), (107.2, 9), (105, 9), (105, 11)]),
        ]
        for name, category, description, coords in polygons:
            PolygonFeature.objects.update_or_create(name=name, category=category, defaults={'description': description, 'geometry': Polygon(coords, srid=4326)})

    def ensure_boundaries_and_routes(self):
        if not Boundary.objects.filter(type='module_05_basin').exists():
            basin = Polygon([(103.5, 23.3), (106.7, 23.3), (106.7, 20.1), (103.5, 20.1), (103.5, 23.3)], srid=4326)
            Boundary.objects.update_or_create(name='L?u v?c s?ng H?ng', type='module_05_basin', defaults={'code': 'LVSH', 'geometry': MultiPolygon(basin, srid=4326)})

        if not Route.objects.filter(type='module_05_river').exists():
            routes = [
                ('S?ng H?ng', 'module_05_river', [(103.9, 22.5), (104.8, 21.8), (105.6, 21.1), (106.2, 20.8)]),
                ('S?ng ??', 'module_05_river', [(103.3, 22.0), (104.5, 21.4), (105.4, 21.0)]),
                ('S?ng Ti?n', 'module_05_river', [(105.0, 10.7), (106.2, 10.4), (106.8, 10.2)]),
            ]
            for name, route_type, coords in routes:
                Route.objects.update_or_create(name=name, type=route_type, defaults={'length_km': len(coords) * 120, 'geometry': LineString(coords, srid=4326)})

    def upsert_layers(self, module):
        layers = []
        for name, table_name, geom_type, filter_column, filter_value in module['layers']:
            layer, _ = MapLayer.objects.update_or_create(
                name=name,
                data_source_table=table_name,
                defaults={
                    'geom_type': geom_type,
                    'description': f'Layer học tập cho {module["title"]}',
                    'filter_column': filter_column,
                    'filter_value': filter_value,
                    'school': CURRICULUM['school'],
                    'grade': CURRICULUM['grade_level'],
                    'is_active': True,
                },
            )
            layers.append(layer)
        return layers

    def upsert_lesson(self, module, lesson_type, layers):
        suffix = 'Tổng quan' if lesson_type == 'overview' else 'Thực hành WebGIS'
        lesson, _ = Lesson.objects.update_or_create(
            title=f'{module["title"]} - {suffix}',
            module_code=module['code'],
            lesson_type=lesson_type,
            defaults={
                'description': module['overview'] if lesson_type == 'overview' else module['practice'],
                'subject': CURRICULUM['subject'],
                'grade_level': CURRICULUM['grade_level'],
                'semester': CURRICULUM['semester'],
                'textbook_series': CURRICULUM['textbook_series'],
                'is_published': True,
            },
        )
        lesson.layers.set(layers)
        self.replace_steps(lesson, module, layers, lesson_type)
        return lesson

    def replace_steps(self, lesson, module, layers, lesson_type):
        action_ids = list(lesson.steps.exclude(map_action=None).values_list('map_action_id', flat=True))
        lesson.steps.all().delete()
        MapAction.objects.filter(id__in=action_ids).delete()
        zoom_boost = 0.8 if lesson_type == 'practice' else 0
        intro_layer_ids = [layer.id for layer in layers[:min(4, len(layers))]]
        focus_layer_ids = [layer.id for layer in layers[:min(2, len(layers))]]
        all_layer_ids = [layer.id for layer in layers]
        actions = [
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_off': 'all', 'layers_on': intro_layer_ids, 'fit_to_layers': True}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_off': 'all', 'layers_on': focus_layer_ids or intro_layer_ids, 'fit_to_layers': True}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'] + zoom_boost, 'layers_off': 'all', 'layers_on': all_layer_ids, 'fit_to_layers': True}),
        ]
        texts = module['steps'].copy()
        if lesson_type == 'practice':
            texts[0] = f'Khởi động bài thực hành WebGIS cho {module["title"].lower()}.'
        for order, (text, action) in enumerate(zip(texts, actions), start=1):
            LessonStep.objects.create(lesson=lesson, order=order, popup_text=text, map_action=action)

    def upsert_quiz(self, module, lesson, classroom):
        quiz, _ = Quiz.objects.update_or_create(
            title=f'Quiz - {module["title"]}',
            module_code=module['code'],
            defaults={
                'lesson': lesson,
                'classroom': classroom,
                'description': f'Bài quiz củng cố kiến thức cho {module["title"].lower()}.',
                'subject': CURRICULUM['subject'],
                'grade_level': CURRICULUM['grade_level'],
                'semester': CURRICULUM['semester'],
                'textbook_series': CURRICULUM['textbook_series'],
                'is_published': True,
                'due_date': timezone.now() + timedelta(days=14),
            },
        )
        quiz.questions.all().delete()
        for order, (question_text, answers, correct_index) in enumerate(module['questions'], start=1):
            question = QuizQuestion.objects.create(quiz=quiz, question_text=question_text, order=order)
            for index, answer_text in enumerate(answers):
                QuizAnswer.objects.create(question=question, answer_text=answer_text, is_correct=index == correct_index)
        return quiz

    def upsert_assignments(self, classroom, module, practice, quiz):
        created_ids = []
        lesson_assignment, _ = Assignment.objects.update_or_create(
            classroom=classroom,
            title=f'[HK1] {module["title"]} - bài thực hành',
            defaults={
                'description': 'Mở bài thực hành WebGIS, quan sát đủ layer cốt lõi rồi trả lời phần ghi chú ngắn.',
                'due_date': timezone.now() + timedelta(days=7),
                'max_score': 10,
                'created_by': classroom.teacher,
                'resource_type': 'lesson',
                'resource_id': practice.id,
            },
        )
        created_ids.append(lesson_assignment.id)
        quiz_assignment, _ = Assignment.objects.update_or_create(
            classroom=classroom,
            title=f'[HK1] {module["title"]} - quiz củng cố',
            defaults={
                'description': 'Làm quiz củng cố sau khi học xong module.',
                'due_date': timezone.now() + timedelta(days=10),
                'max_score': 10,
                'created_by': classroom.teacher,
                'resource_type': 'quiz',
                'resource_id': quiz.id,
            },
        )
        created_ids.append(quiz_assignment.id)
        return created_ids

    def cleanup_legacy_content(self, classroom, curated_lesson_ids, curated_quiz_ids, curated_assignment_ids):
        Lesson.objects.filter(grade_level=CURRICULUM['grade_level'], semester=CURRICULUM['semester'], textbook_series=CURRICULUM['textbook_series']).exclude(id__in=curated_lesson_ids).update(is_published=False)
        Quiz.objects.filter(grade_level=CURRICULUM['grade_level'], semester=CURRICULUM['semester'], textbook_series=CURRICULUM['textbook_series']).exclude(id__in=curated_quiz_ids).update(is_published=False)
        Classroom.objects.filter(grade_level=CURRICULUM['grade_level'], semester=CURRICULUM['semester'], textbook_series=CURRICULUM['textbook_series']).exclude(id=classroom.id).update(is_published=False)
        Assignment.objects.filter(classroom=classroom).exclude(id__in=curated_assignment_ids).delete()

        curated_layer_ids = set(
            Lesson.objects.filter(id__in=curated_lesson_ids).values_list('layers__id', flat=True)
        )
        MapLayer.objects.filter(
            school=CURRICULUM['school'],
            grade=CURRICULUM['grade_level'],
        ).exclude(id__in=curated_layer_ids).update(is_active=False)

        valid_lesson_ids = set(curated_lesson_ids)
        valid_quiz_ids = set(curated_quiz_ids)
        for assignment in Assignment.objects.exclude(classroom=classroom).exclude(resource_id=None):
            if assignment.resource_type == 'lesson' and assignment.resource_id not in valid_lesson_ids:
                assignment.resource_type = ''
                assignment.resource_id = None
                assignment.save(update_fields=['resource_type', 'resource_id'])
            elif assignment.resource_type == 'quiz' and assignment.resource_id not in valid_quiz_ids:
                assignment.resource_type = ''
                assignment.resource_id = None
                assignment.save(update_fields=['resource_type', 'resource_id'])
