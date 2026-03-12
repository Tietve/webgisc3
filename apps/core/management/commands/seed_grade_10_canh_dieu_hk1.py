"""
Seed command for ??a l? 10 C?nh Di?u HK1 MVP.
"""
from datetime import timedelta

from django.contrib.gis.geos import LineString, MultiPolygon, Point, Polygon
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.classrooms.models import Assignment, Classroom, Enrollment
from apps.gis_data.models import Boundary, LineFeature, MapLayer, PointOfInterest, PolygonFeature, Route
from apps.lessons.models import Lesson, LessonStep, MapAction
from apps.quizzes.models import Quiz, QuizAnswer, QuizQuestion
from apps.users.models import User


MODULES = [
    {
        'code': 'module-01',
        'title': 'B?n ?? v? ph??ng ph?p bi?u hi?n ??i t??ng ??a l?',
        'center': [106.0, 16.0],
        'zoom': 4,
        'layers': [
            ('K? hi?u ?i?m ??a l?', 'points_of_interest', 'POINT', 'category', 'module_01_point'),
            ('Tuy?n giao th?ng minh h?a', 'line_features', 'LINESTRING', 'category', 'module_01_flow'),
            ('V?ng bi?u hi?n di?n t?ch', 'polygon_features', 'POLYGON', 'category', 'module_01_region'),
        ],
        'questions': [
            ('Ph??ng ph?p k? hi?u ph? h?p nh?t ?? th? hi?n c?ng bi?n l? g??', 'Ph??ng ph?p k? hi?u', ['Ph??ng ph?p k? hi?u', 'Ph??ng ph?p ch?m ?i?m', 'Ph??ng ph?p b?n ?? - bi?u ??', 'Ph??ng ph?p ???ng chuy?n ??ng'], 0),
            ('??i t??ng n?o th??ng bi?u hi?n b?ng ???ng chuy?n ??ng?', 'Lu?ng di chuy?n h?ng h?a', ['Nh? m?y ?i?n', 'Lu?ng di chuy?n h?ng h?a', 'M?t ?? d?n s?', 'Nhi?t ?? trung b?nh'], 1),
            ('??i t??ng ph?n b? tr?n di?n r?ng th??ng h?p v?i ph??ng ph?p n?o?', 'Khoanh v?ng', ['K? hi?u ch?', 'K? hi?u ?i?m', 'Khoanh v?ng', 'Bi?u ?? c?t'], 2),
            ('B?n ?? c?n c? th?nh ph?n n?o ?? x?c ??nh ph??ng h??ng?', 'M?i t?n ch? B?c', ['?nh v? tinh', 'M?i t?n ch? B?c', 'Thuy?t minh ?m thanh', 'Video'], 1),
            ('T? l? b?n ?? cho bi?t ?i?u g??', 'M?i quan h? gi?a kho?ng c?ch tr?n b?n ?? v? th?c ??a', ['?? cao ??a h?nh', 'D?n s? ??a ph??ng', 'M?i quan h? gi?a kho?ng c?ch tr?n b?n ?? v? th?c ??a', 'H??ng gi? ch? ??o'], 2),
            ('Ch? gi?i b?n ?? d?ng ?? l?m g??', 'Gi?i th?ch k? hi?u v? m?u s?c', ['T?ng ?? s?ng', 'Gi?i th?ch k? hi?u v? m?u s?c', '??i ng?n ng?', 'T?nh di?n t?ch'], 1),
            ('L?p b?n ?? ?i?m trong module 01 minh h?a d?ng ??i t??ng n?o?', '??i t??ng ph?n b? theo ?i?m', ['??i t??ng ph?n b? theo ?i?m', '??i t??ng ph?n b? theo tuy?n gi?', '??i t??ng ph?n b? theo mi?n kh? h?u', '??i t??ng ph?n b? theo ??i ??t'], 0),
            ('Khi c?n th? hi?n m?ng l??i li?n k?t, n?n ?u ti?n ki?u d? li?u n?o?', '???ng', ['?i?m', '???ng', 'V?ng', 'B?ng'], 1),
        ],
    },
    {
        'code': 'module-02',
        'title': 'Tr?i ??t, kinh v? tuy?n, m?i gi? v? h? qu? chuy?n ??ng',
        'center': [0, 20],
        'zoom': 1.6,
        'layers': [
            ('Kinh v? tuy?n ch?nh', 'line_features', 'LINESTRING', 'category', 'module_02_grid'),
            ('M?i gi? tham chi?u', 'polygon_features', 'POLYGON', 'category', 'module_02_timezone'),
            ('?i?m b?i t?p t?a ??', 'points_of_interest', 'POINT', 'category', 'module_02_point'),
        ],
        'questions': [
            ('Kinh tuy?n g?c ?i qua ??a ?i?m n?o?', 'Greenwich', ['H? N?i', 'Greenwich', 'Tokyo', 'New York'], 1),
            ('X?ch ??o l? ???ng g??', 'V? tuy?n 0?', ['Kinh tuy?n 0?', 'V? tuy?n 0?', 'Ch? tuy?n B?c', 'V?ng c?c B?c'], 1),
            ('M?i m?i gi? chu?n r?ng kho?ng bao nhi?u kinh ???', '15?', ['10?', '12?', '15?', '24?'], 2),
            ('Vi?t Nam thu?c m?i gi? s? m?y?', 'UTC+7', ['UTC+5', 'UTC+6', 'UTC+7', 'UTC+8'], 2),
            ('H? qu? r? nh?t c?a Tr?i ??t t? quay quanh tr?c l? g??', 'Lu?n phi?n ng?y ??m', ['T?o m?a', 'Lu?n phi?n ng?y ??m', 'N?i l?a', 'M?a ph?n'], 1),
            ('N?u ?i t? t?y sang ??ng, gi? ??a ph??ng thay ??i th? n?o?', 'T?ng l?n', ['Gi?m xu?ng', 'Kh?ng ??i', 'T?ng l?n', '??i ng?u nhi?n'], 2),
            ('Ch? tuy?n B?c n?m kho?ng v? ?? n?o?', '23?27?B', ['0?', '23?27?B', '66?33?B', '90?B'], 1),
            ('L?p ?i?m module 02 d?ng ch? y?u ?? l?m g??', 'Luy?n x?c ??nh t?a ??', ['T?nh d?n s?', 'Luy?n x?c ??nh t?a ??', '?o m?a', 'X?c ??nh ??t'], 1),
        ],
    },
    {
        'code': 'module-03',
        'title': 'Kh? quy?n, nhi?t ??, kh? ?p, gi? v? m?a',
        'center': [100.0, 15.0],
        'zoom': 2.3,
        'layers': [
            ('?ai gi? h?nh tinh', 'line_features', 'LINESTRING', 'category', 'module_03_wind'),
            ('V?ng kh? h?u minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_03_climate'),
            ('Tr?m kh? t??ng m?u', 'points_of_interest', 'POINT', 'category', 'module_03_station'),
        ],
        'questions': [
            ('Kh?ng kh? n?ng c? xu h??ng nh? th? n?o?', 'B?c l?n', ['B?c l?n', 'Ch?m xu?ng', '??ng y?n', 'Tan bi?n'], 0),
            ('Kh? ?p l? g??', 'S?c ?p c?a kh?ng kh? l?n b? m?t', ['?? ?m c?a ??t', 'S?c ?p c?a kh?ng kh? l?n b? m?t', 'Nhi?t ?? n??c bi?n', 'L??ng m?a th?ng'], 1),
            ('Gi? h?nh th?nh ch? y?u do s? ch?nh l?ch n?o?', 'Kh? ?p', ['M?u ??t', 'Kh? ?p', 'M?c n??c h?', '?? m?n'], 1),
            ('M?a nhi?u th??ng x?y ra ? n?i c? qu? tr?nh n?o?', 'Kh?ng kh? b?c l?n v? ng?ng t?', ['Kh?ng kh? b?c l?n v? ng?ng t?', 'Kh?ng kh? h? xu?ng', 'B?c h?i y?u', '??a h?nh b?ng ph?ng'], 0),
            ('Gi? T?n phong th?i t? ??u t?i ??u?', 'T? ?p cao ch? tuy?n v? ?p th?p x?ch ??o', ['T? c?c v? ch? tuy?n', 'T? ?p cao ch? tuy?n v? ?p th?p x?ch ??o', 'T? bi?n v?o ??t li?n ban ??m', 'T? ??t li?n ra bi?n ban ng?y'], 1),
            ('Y?u t? n?o ?nh h??ng m?nh ??n nhi?t ?? kh?ng kh??', 'V? ?? ??a l?', ['Lo?i kho?ng s?n', 'V? ?? ??a l?', 'M?u c?', 'S? l??ng ???ng'], 1),
            ('L?p polygon module 03 d?ng ?? minh h?a g??', 'S? ph?n h?a v?ng kh? h?u', ['M?ng l??i s?ng', 'S? ph?n h?a v?ng kh? h?u', 'Ranh gi?i t?nh', 'Khu c?ng nghi?p'], 1),
            ('Tr?m kh? t??ng th??ng thu th?p nh?m th?ng tin n?o?', 'Nhi?t ??, m?a, gi?', ['Gi? v?ng, ngo?i t?', 'Nhi?t ??, m?a, gi?', 'D?n s?, lao ??ng', 'S?n l??ng l?a'], 1),
        ],
    },
    {
        'code': 'module-04',
        'title': 'Th?y quy?n, n??c tr?n l?c ??a v? ch? ?? n??c s?ng',
        'center': [105.8, 21.3],
        'zoom': 5,
        'layers': [
            ('S?ng H?ng v? ph? l?u', 'routes', 'LINESTRING', 'type', 'Song'),
            ('L?u v?c s?ng H?ng', 'boundaries', 'POLYGON', 'type', 'Luu vuc song Hong'),
            ('Tr?m th?y v?n', 'points_of_interest', 'POINT', 'category', 'Tram thuy van'),
        ],
        'questions': [
            ('Ngu?n cung c?p n??c ch?nh cho s?ng l? g??', 'M?a, b?ng tuy?t v? n??c ng?m', ['Ch? c? n??c bi?n', 'M?a, b?ng tuy?t v? n??c ng?m', 'Ch? c? h? ch?a', 'Ch? c? n??c ng?m'], 1),
            ('Ch? ?? n??c s?ng l? g??', 'S? bi?n ??i l?u l??ng n??c theo th?i gian', ['?? s?u tuy?t ??i c?a bi?n', 'S? bi?n ??i l?u l??ng n??c theo th?i gian', 'T?n s?ng ??a ph??ng', 'H??ng gi? m?a ??ng'], 1),
            ('L?u v?c s?ng l? g??', 'Ph?n di?n t?ch cung c?p n??c cho m?t h? th?ng s?ng', ['Ph?n di?n t?ch cung c?p n??c cho m?t h? th?ng s?ng', '???ng b? bi?n', 'V?ng n?i cao nh?t', 'M?t th?nh ph? ven s?ng'], 0),
            ('M?a l? s?ng H?ng g?n nhi?u v?i y?u t? n?o?', 'M?a m?a h?', ['M?a m?a h?', 'Gi? m?a ??ng b?c kh?', 'S??ng m?', 'Tri?u c??ng ??i d??ng'], 0),
            ('Tr?m th?y v?n d?ng ?? l?m g??', 'Theo d?i m?c n??c v? l?u l??ng', ['Theo d?i m?c n??c v? l?u l??ng', 'D? b?o ??ng ??t', '?o d?n s?', 'B?n v? t?u'], 0),
            ('N??c tr?n l?c ??a g?m nh?ng d?ng ch? y?u n?o?', 'S?ng, h?, b?ng h?, n??c ng?m', ['S?ng, h?, b?ng h?, n??c ng?m', 'Ch? c? n??c m?a', 'Ch? c? ??i d??ng', 'Ch? c? ao h?'], 0),
            ('? v?ng nhi?t ??i gi? m?a, ch? ?? n??c s?ng th??ng nh? th? n?o?', 'Bi?n ??i m?nh theo m?a', ['?n ??nh quanh n?m', 'Bi?n ??i m?nh theo m?a', 'Kh?ng c? l?', 'Ch? t?ng v?o m?a ??ng'], 1),
            ('Trong lesson th?c h?nh, l?p n?o gi?p x?c ??nh ph?m vi c?p n??c cho s?ng?', 'L?u v?c s?ng H?ng', ['Tr?m th?y v?n', 'L?u v?c s?ng H?ng', 'C?ng bi?n', 'S?n bay'], 1),
        ],
    },
    {
        'code': 'module-05',
        'title': 'Th? nh??ng, sinh quy?n, v? ??a l? v? quy lu?t c? b?n',
        'center': [108.0, 14.0],
        'zoom': 4.2,
        'layers': [
            ('??i ??t minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_05_soil'),
            ('??i sinh v?t minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_05_biome'),
            ('?i?m quan s?t h? sinh th?i', 'points_of_interest', 'POINT', 'category', 'module_05_ecosystem'),
        ],
        'questions': [
            ('Th? nh??ng ???c hi?u l? g??', 'L?p v?t ch?t t?i x?p tr?n b? m?t l?c ??a', ['L?p v?t ch?t t?i x?p tr?n b? m?t l?c ??a', 'N??c ng?m', 'Kho?ng s?n kim lo?i', 'Kh?ng kh? t?ng cao'], 0),
            ('Sinh quy?n l? g??', 'Ph?m vi c? sinh v?t sinh s?ng', ['Ph?m vi c? sinh v?t sinh s?ng', 'T?ng ??i l?u', '?? magma', '???ng ??ng nhi?t'], 0),
            ('V? ??a l? l? l?p v? n?i c?c th?nh ph?n t? nhi?n t?c ??ng qua l?i m?nh m?', '??ng', ['??ng', 'Sai', 'Ch? ??ng ? bi?n', 'Ch? ??ng ? n?i'], 0),
            ('Quy lu?t ??a ??i g?n ch? y?u v?i s? thay ??i theo h??ng n?o?', 'V? ??', ['Kinh ??', 'V? ??', '?? s?u bi?n', 'Th?i gian l?ch s?'], 1),
            ('Quy lu?t phi ??a ??i ch?u ?nh h??ng m?nh c?a y?u t? n?o?', '??a h?nh v? l?c ??a - ??i d??ng', ['??a h?nh v? l?c ??a - ??i d??ng', 'T?n t?nh', 'M?u b?n ??', 'M? b?u ch?nh'], 0),
            ('??t v? sinh v?t c? quan h? nh? th? n?o?', 'T?c ??ng qua l?i ch?t ch?', ['Ho?n to?n t?ch r?i', 'T?c ??ng qua l?i ch?t ch?', 'Ch? ??t ?nh h??ng sinh v?t', 'Ch? sinh v?t ?nh h??ng ??t'], 1),
            ('L?p ecosystem point trong module 05 d?ng ?? l?m g??', 'N?u v? d? h? sinh th?i ti?u bi?u', ['T?nh m?i gi?', 'N?u v? d? h? sinh th?i ti?u bi?u', '?o l?u l??ng s?ng', 'X?c ??nh c?ng bi?n'], 1),
            ('Khi ph?n t?ch v? ??a l?, c?n ch? ? ?i?u g??', 'T?nh t?ng h?p c?a c?c th?nh ph?n t? nhi?n', ['Ch? m?t y?u t? ri?ng l?', 'T?nh t?ng h?p c?a c?c th?nh ph?n t? nhi?n', 'Ch? y?u t? d?n c?', 'Ch? giao th?ng'], 1),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed ??a l? 10 C?nh Di?u HK1 MVP data'

    @transaction.atomic
    def handle(self, *args, **options):
        teacher, students = self.ensure_users()
        classroom = self.ensure_classroom(teacher)
        self.ensure_enrollments(classroom, students)
        self.seed_spatial_data()
        resources = self.seed_curriculum(classroom)
        self.seed_assignments(classroom, resources)
        self.stdout.write(self.style.SUCCESS('Seeded grade 10 Canh Dieu HK1 MVP data.'))

    def ensure_users(self):
        teacher, _ = User.objects.get_or_create(
            email='teacher10@webgis.com',
            defaults={'role': 'teacher'}
        )
        teacher.set_password('teacher123')
        teacher.save(update_fields=['password'])

        students = []
        for index in range(1, 3):
            student, _ = User.objects.get_or_create(
                email=f'student10{index}@webgis.com',
                defaults={'role': 'student'}
            )
            student.set_password('student123')
            student.save(update_fields=['password'])
            students.append(student)
        return teacher, students

    def ensure_classroom(self, teacher):
        classroom, _ = Classroom.objects.update_or_create(
            name='??a l? 10 - C?nh Di?u - HK1',
            teacher=teacher,
            defaults={
                'subject': '??a l?',
                'grade_level': '10',
                'semester': '1',
                'textbook_series': 'canh-dieu',
                'module_code': '',
                'is_published': True,
            },
        )
        return classroom

    def ensure_enrollments(self, classroom, students):
        for student in students:
            Enrollment.objects.get_or_create(classroom=classroom, student=student)

    def seed_spatial_data(self):
        self.ensure_points()
        self.ensure_lines()
        self.ensure_polygons()
        self.ensure_boundaries_and_routes()

    def ensure_points(self):
        points = [
            ('H? N?i', 'module_01_point', 105.8342, 21.0278), ('?? N?ng', 'module_01_point', 108.2022, 16.0544), ('TP.HCM', 'module_01_point', 106.6297, 10.8231),
            ('?i?m A', 'module_02_point', 105.0, 10.0), ('?i?m B', 'module_02_point', 120.0, 20.0), ('?i?m C', 'module_02_point', 90.0, 0.0),
            ('H? N?i Station', 'module_03_station', 105.8342, 21.0278), ('Hu? Station', 'module_03_station', 107.59, 16.4637), ('C?n Th? Station', 'module_03_station', 105.7851, 10.0452),
            ('Tr?m Y?n B?i', 'Tram thuy van', 104.873, 21.722), ('Tr?m S?n T?y', 'Tram thuy van', 105.505, 21.138), ('Tr?m H? N?i', 'Tram thuy van', 105.834, 21.028),
            ('R?ng m?a nhi?t ??i', 'module_05_ecosystem', 107.5, 15.8), ('R?ng ng?p m?n', 'module_05_ecosystem', 106.8, 9.4), ('Th?o nguy?n n?i cao', 'module_05_ecosystem', 103.8, 22.3),
        ]
        for name, category, lon, lat in points:
            PointOfInterest.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': name, 'geometry': Point(lon, lat, srid=4326)},
            )

    def ensure_lines(self):
        lines = [
            ('Lu?ng h?ng h?a B?c - Nam', 'module_01_flow', [(105.8, 21.0), (108.2, 16.0), (106.7, 10.8)]),
            ('???ng du l?ch di s?n', 'module_01_flow', [(105.8, 21.0), (107.58, 16.46), (108.33, 15.88)]),
            ('X?ch ??o', 'module_02_grid', [(-180, 0), (180, 0)]),
            ('Kinh tuy?n g?c', 'module_02_grid', [(0, -60), (0, 80)]),
            ('Ch? tuy?n B?c', 'module_02_grid', [(-180, 23.5), (180, 23.5)]),
            ('?ai gi? T?n phong B?c b?n c?u', 'module_03_wind', [(-70, 25), (-20, 15), (40, 5)]),
            ('?ai gi? T?y ?n ??i', 'module_03_wind', [(-80, 40), (0, 50), (80, 45)]),
        ]
        for name, category, coords in lines:
            LineFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': name, 'geometry': LineString(coords, srid=4326)},
            )

    def ensure_polygons(self):
        polygons = [
            ('V?ng minh h?a ??ng b?ng', 'module_01_region', [(104, 21), (106.5, 21), (106.5, 19.5), (104, 19.5), (104, 21)]),
            ('V?ng minh h?a cao nguy?n', 'module_01_region', [(107, 14.8), (109, 14.8), (109, 12.8), (107, 12.8), (107, 14.8)]),
            ('M?i gi? UTC+7', 'module_02_timezone', [(97.5, -50), (112.5, -50), (112.5, 80), (97.5, 80), (97.5, -50)]),
            ('M?i gi? UTC+8', 'module_02_timezone', [(112.5, -50), (127.5, -50), (127.5, 80), (112.5, 80), (112.5, -50)]),
            ('Kh? h?u nhi?t ??i ?m', 'module_03_climate', [(100, 20), (110, 20), (110, 8), (100, 8), (100, 20)]),
            ('Kh? h?u c?n nhi?t n?i cao', 'module_03_climate', [(102, 24), (106, 24), (106, 20), (102, 20), (102, 24)]),
            ('??t feralit', 'module_05_soil', [(104, 20), (110, 20), (110, 10), (104, 10), (104, 20)]),
            ('??t ph? sa', 'module_05_soil', [(105, 10.8), (106.8, 10.8), (106.8, 9.2), (105, 9.2), (105, 10.8)]),
            ('R?ng nhi?t ??i', 'module_05_biome', [(104, 18), (110, 18), (110, 10), (104, 10), (104, 18)]),
            ('R?ng ng?p m?n', 'module_05_biome', [(105.5, 10.3), (107.5, 10.3), (107.5, 8.9), (105.5, 8.9), (105.5, 10.3)]),
        ]
        for name, category, coords in polygons:
            PolygonFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': name, 'geometry': Polygon(coords, srid=4326)},
            )

    def ensure_boundaries_and_routes(self):
        basin_polygon = Polygon([(103.5, 23.5), (106.5, 23.5), (106.5, 20.2), (103.5, 20.2), (103.5, 23.5)], srid=4326)
        Boundary.objects.update_or_create(
            name='L?u v?c s?ng H?ng',
            type='Luu vuc song Hong',
            defaults={'code': 'LVSH', 'geometry': MultiPolygon(basin_polygon, srid=4326)},
        )
        routes = [
            ('S?ng H?ng', 'Song', [(103.9, 22.5), (104.8, 21.8), (105.6, 21.1), (106.2, 20.8)]),
            ('S?ng ??', 'Song', [(103.3, 22.0), (104.5, 21.4), (105.4, 21.0)]),
            ('S?ng L?', 'Song', [(104.9, 22.6), (105.4, 21.9), (106.0, 21.4)]),
        ]
        for name, route_type, coords in routes:
            Route.objects.update_or_create(
                name=name,
                type=route_type,
                defaults={'length_km': len(coords) * 120, 'geometry': LineString(coords, srid=4326)},
            )

    def seed_curriculum(self, classroom):
        resources = []
        for module in MODULES:
            layers = []
            for name, table_name, geom_type, filter_column, filter_value in module['layers']:
                layer, _ = MapLayer.objects.update_or_create(
                    name=name,
                    defaults={
                        'data_source_table': table_name,
                        'geom_type': geom_type,
                        'description': f"{module['title']} - {name}",
                        'filter_column': filter_column,
                        'filter_value': filter_value,
                        'school': 'THPT',
                        'grade': '10',
                        'is_active': True,
                    },
                )
                layers.append(layer)

            overview = self.upsert_lesson(module, 'overview', layers)
            practice = self.upsert_lesson(module, 'practice', layers)
            quiz = self.upsert_quiz(module, overview, classroom)
            resources.append({'module': module, 'overview': overview, 'practice': practice, 'quiz': quiz})
        return resources

    def upsert_lesson(self, module, lesson_type, layers):
        suffix = 'T?ng quan' if lesson_type == 'overview' else 'Th?c h?nh WebGIS'
        lesson, _ = Lesson.objects.update_or_create(
            title=f"{module['title']} - {suffix}",
            defaults={
                'description': f"B?i {suffix.lower()} cho {module['title']}. N?i dung bi?n so?n ng?n g?n ?? h?c sinh quan s?t v? thao t?c tr?n WebGIS.",
                'subject': '??a l?',
                'grade_level': '10',
                'semester': '1',
                'textbook_series': 'canh-dieu',
                'module_code': module['code'],
                'lesson_type': lesson_type,
                'is_published': True,
            },
        )
        lesson.layers.set(layers)
        lesson.steps.all().delete()
        self.create_steps(lesson, module, layers, lesson_type)
        return lesson

    def create_steps(self, lesson, module, layers, lesson_type):
        actions = [
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_off': 'all'}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_on': [layer.id for layer in layers[:2]]}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'] + (1 if lesson_type == 'practice' else 0), 'layers_on': [layer.id for layer in layers]}),
        ]
        texts = [
            f"M?c ti?u: n?m ? ch?nh c?a {module['title']} v? x?c ??nh ???c c?c l?p b?n ?? li?n quan.",
            f"Quan s?t 2 l?p tr?ng t?m ??u ti?n ?? nh?n ra c?u tr?c ki?n th?c c?a {module['title']}.",
            f"B?t to?n b? layer pack c?a {module['code']} v? tr? l?i c?u h?i ng?n cu?i b?i b?ng quan s?t b?n ??.",
        ]
        if lesson_type == 'practice':
            texts[0] = f"Kh?i ??ng th?c h?nh WebGIS cho {module['title']}. Chu?n b? quan s?t v? ??i chi?u c?c l?p d? li?u."
        for order, (text, action) in enumerate(zip(texts, actions), start=1):
            LessonStep.objects.create(lesson=lesson, order=order, popup_text=text, map_action=action)

    def upsert_quiz(self, module, lesson, classroom):
        quiz, _ = Quiz.objects.update_or_create(
            title=f"Quiz - {module['title']}",
            defaults={
                'lesson': lesson,
                'classroom': classroom,
                'description': f"Ki?m tra nhanh 8 c?u cho {module['title']}.",
                'subject': '??a l?',
                'grade_level': '10',
                'semester': '1',
                'textbook_series': 'canh-dieu',
                'module_code': module['code'],
                'is_published': True,
                'due_date': timezone.now() + timedelta(days=14),
            },
        )
        quiz.questions.all().delete()
        for order, (question_text, correct_text, answers, correct_index) in enumerate(module['questions'], start=1):
            question = QuizQuestion.objects.create(quiz=quiz, question_text=question_text, order=order)
            for index, answer_text in enumerate(answers):
                QuizAnswer.objects.create(question=question, answer_text=answer_text, is_correct=index == correct_index)
        return quiz

    def seed_assignments(self, classroom, resources):
        Assignment.objects.filter(classroom=classroom).exclude(title__startswith='[HK1]').delete()
        for resource in resources:
            module = resource['module']
            Assignment.objects.update_or_create(
                classroom=classroom,
                title=f"[HK1] {module['title']} - b?i h?c th?c h?nh",
                defaults={
                    'description': 'M? b?i th?c h?nh WebGIS, ho?n th?nh c?c b??c quan s?t v? n?p ph?n tr? l?i ng?n n?u gi?o vi?n y?u c?u.',
                    'due_date': timezone.now() + timedelta(days=7),
                    'max_score': 10,
                    'created_by': classroom.teacher,
                    'resource_type': 'lesson',
                    'resource_id': resource['practice'].id,
                },
            )
            Assignment.objects.update_or_create(
                classroom=classroom,
                title=f"[HK1] {module['title']} - quiz c?ng c?",
                defaults={
                    'description': 'L?m quiz c?ng c? ki?n th?c sau khi h?c xong module.',
                    'due_date': timezone.now() + timedelta(days=10),
                    'max_score': 10,
                    'created_by': classroom.teacher,
                    'resource_type': 'quiz',
                    'resource_id': resource['quiz'].id,
                },
            )

