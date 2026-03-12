"""
Seed curated ??a l? 10 - C?nh Di?u - H?c k? 1 content.
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


CURRICULUM = {
    'subject': '??a l?',
    'grade_level': '10',
    'semester': '1',
    'textbook_series': 'canh-dieu',
    'school': 'THPT',
}

MODULES = [
    {
        'code': 'module-01',
        'title': 'B?n ??, GPS, b?n ?? s? v? ph??ng ph?p bi?u hi?n ??i t??ng ??a l?',
        'center': [106.2, 16.2],
        'zoom': 4.6,
        'layers': [
            ('Ranh gi?i t?nh, th?nh Vi?t Nam', 'vietnam_provinces', 'MULTIPOLYGON', None, None),
            ('?i?m d?n c? v? ?? th? m?u', 'points_of_interest', 'POINT', 'category', 'module_01_city'),
            ('Tuy?n giao th?ng minh h?a', 'line_features', 'LINESTRING', 'category', 'module_01_route'),
            ('V?ng bi?u hi?n theo di?n t?ch', 'polygon_features', 'POLYGON', 'category', 'module_01_region'),
        ],
        'overview': 'Nh?n bi?t th?nh ph?n c? b?n c?a b?n ??, vai tr? c?a GPS v? b?n ?? s?, c?ng c?c c?ch bi?u hi?n ?i?m, ???ng, v?ng tr?n b?n ??.',
        'practice': 'Quan s?t c?ng l?c l?p ?i?m, l?p tuy?n v? l?p v?ng ?? ph?n bi?t c?ch th? hi?n ??i t??ng ??a l? tr?n WebGIS.',
        'steps': [
            'X?c ??nh t?n l?p, ch? gi?i v? ph?m vi quan s?t ch?nh c?a module 01.',
            'So s?nh l?p ?i?m, l?p tuy?n v? l?p v?ng ?? nh?n ra m?i lo?i d? li?u ph? h?p v?i d?ng ??i t??ng n?o.',
            'B?t to?n b? layer pack module 01 r?i ghi l?i v? d? v? ??i t??ng ?i?m, ???ng v? v?ng m? em quan s?t ???c.',
        ],
        'questions': [
            ('Ph??ng ph?p k? hi?u ph? h?p nh?t ?? th? hi?n c?ng bi?n l? g??', ['Ph??ng ph?p k? hi?u', 'Ph??ng ph?p ???ng chuy?n ??ng', 'Ph??ng ph?p ch?m ?i?m', 'Ph??ng ph?p b?n ?? - bi?u ??'], 0),
            ('N?u mu?n th? hi?n m?ng l??i giao th?ng, l?p d? li?u n?o ph? h?p nh?t?', ['?i?m', '???ng', 'V?ng', 'B?ng s? li?u'], 1),
            ('Ch? gi?i b?n ?? d?ng ?? l?m g??', ['Ch? h??ng B?c', 'Gi?i th?ch k? hi?u v? m?u s?c', '?o nhi?t ??', 'T?nh d?n s?'], 1),
            ('T? l? b?n ?? cho bi?t ?i?u g??', ['Kho?ng c?ch th?t v? kho?ng c?ch tr?n b?n ??', 'L??ng m?a trung b?nh n?m', '?? d?c ??a h?nh', 'S? d?n ?? th?'], 0),
            ('B?n ?? s? gi?p h?c sinh l?m g? thu?n ti?n h?n?', ['Quan s?t, b?t t?t l?p v? ph?ng to thu nh?', 'L?m th? nghi?m h?a h?c', '?o nh?p tim', 'Thay s?ch gi?o khoa'], 0),
            ('GPS th??ng ???c d?ng ?? x?c ??nh ?i?u g??', ['V? tr?', '?? m?n', 'Lo?i ??t', 'D?n s?'], 0),
            ('??i t??ng ph?n b? theo di?n r?ng th??ng h?p v?i c?ch bi?u hi?n n?o?', ['K? hi?u ?i?m', 'Khoanh v?ng', 'Bi?u ?? tr?n t?i ?i?m', '???ng chuy?n ??ng'], 1),
            ('Khi nh?n l?p v?ng trong module 01, em ?ang luy?n k? n?ng n?o?', ['Ph?n bi?t ph?n b? theo di?n t?ch', 'T?nh t?c ?? gi?', '??c m?i gi?', 'X?c ??nh ?? cao tuy?t ??i'], 0),
        ],
    },
    {
        'code': 'module-02',
        'title': 'Tr?i ??t, kinh v? tuy?n, m?i gi? v? h? qu? chuy?n ??ng',
        'center': [30, 15],
        'zoom': 1.8,
        'layers': [
            ('???ng kinh v? tuy?n ti?u bi?u', 'line_features', 'LINESTRING', 'category', 'module_02_reference_lines'),
            ('M?i gi? minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_02_timezone'),
            ('?i?m b?i t?p t?a ??', 'points_of_interest', 'POINT', 'category', 'module_02_coordinate'),
        ],
        'overview': '?n c?ch x?c ??nh kinh tuy?n, v? tuy?n, m?i gi? v? hi?u h? qu? ch?nh c?a chuy?n ??ng t? quay quanh tr?c v? chuy?n ??ng quanh M?t Tr?i.',
        'practice': 'D?ng WebGIS ?? nh?n di?n x?ch ??o, ch? tuy?n, m?i gi? v? ??c nhanh t?a ?? c?a c?c ?i?m m?u.',
        'steps': [
            'X?c ??nh x?ch ??o, ch? tuy?n v? kinh tuy?n g?c tr?n b?n ?? th? gi?i.',
            'B?t l?p m?i gi? ?? so s?nh v? tr? c?a Vi?t Nam v?i c?c khu v?c kh?c.',
            'M? l?p ?i?m t?a ?? v? luy?n ??c kinh ??, v? ?? c?a t?ng ?i?m.',
        ],
        'questions': [
            ('Kinh tuy?n g?c ?i qua ??a ?i?m n?o?', ['Greenwich', 'H? N?i', 'Tokyo', 'Paris'], 0),
            ('X?ch ??o l? ???ng g??', ['Kinh tuy?n 0 ??', 'V? tuy?n 0 ??', 'Ch? tuy?n B?c', 'V?ng c?c B?c'], 1),
            ('M?t m?i gi? chu?n r?ng kho?ng bao nhi?u kinh ???', ['10 ??', '12 ??', '15 ??', '24 ??'], 2),
            ('Vi?t Nam thu?c m?i gi? n?o?', ['UTC+5', 'UTC+6', 'UTC+7', 'UTC+8'], 2),
            ('H? qu? r? nh?t c?a Tr?i ??t t? quay quanh tr?c l? g??', ['Lu?n phi?n ng?y ??m', '??ng ??t', 'M?a ??', 'N?i l?a'], 0),
            ('N?u ?i t? t?y sang ??ng, gi? ??a ph??ng th??ng thay ??i th? n?o?', ['S?m h?n', 'Mu?n h?n', 'Kh?ng ??i', '??o ng??c ng?u nhi?n'], 0),
            ('Ch? tuy?n B?c n?m g?n v? ?? n?o?', ['0 ??', '23 ?? 27 ph?t B?c', '45 ?? B?c', '66 ?? 33 ph?t B?c'], 1),
            ('L?p ?i?m t?a ?? trong module 02 gi?p r?n k? n?ng g??', ['??c v? x?c ??nh t?a ?? ??a l?', 'Ph?n lo?i ??t', 'Nh?n bi?t l?u v?c s?ng', 'T?nh ?? m?n bi?n'], 0),
        ],
    },
    {
        'code': 'module-03',
        'title': 'Th?ch quy?n, ki?n t?o m?ng, n?i l?c v? ngo?i l?c',
        'center': [105, 12],
        'zoom': 2.3,
        'layers': [
            ('Ranh gi?i m?ng ki?n t?o', 'line_features', 'LINESTRING', 'category', 'module_03_plate_boundary'),
            ('?i?m n?i l?a v? ??ng ??t m?u', 'points_of_interest', 'POINT', 'category', 'module_03_hazard_point'),
            ('D?ng ??a h?nh minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_03_landform'),
        ],
        'overview': 'Nh?n bi?t vai tr? c?a th?ch quy?n, quy lu?t ph?n b? m?ng ki?n t?o v? t?c ??ng c?a n?i l?c, ngo?i l?c ??n b? m?t Tr?i ??t.',
        'practice': 'Quan s?t ranh gi?i m?ng, ?i?m nguy c? v? d?ng ??a h?nh ?? li?n h? gi?a v?n ??ng ki?n t?o v? ??a h?nh b? m?t.',
        'steps': [
            'Quan s?t ???ng ranh gi?i m?ng ?? nh?n ra n?i th??ng t?p trung ho?t ??ng ki?n t?o m?nh.',
            '??i chi?u c?c ?i?m n?i l?a, ??ng ??t v?i ranh gi?i m?ng tr?n b?n ??.',
            'B?t l?p d?ng ??a h?nh v? n?u v? d? v? t?c ??ng c?a n?i l?c ho?c ngo?i l?c.',
        ],
        'questions': [
            ('M?ng ki?n t?o l? g??', ['Kh?i l?n c?a th?ch quy?n ?ang d?ch chuy?n', 'M?t lo?i ??t', 'M?t ??i kh? h?u', 'M?t d?ng bi?n'], 0),
            ('??ng ??t v? n?i l?a th??ng t?p trung nhi?u ? ??u?', ['Ven ranh gi?i m?ng', 'Gi?a sa m?c', 'Trung t?m ??ng b?ng l?n', 'Tr?n m?i n?i nh? nhau'], 0),
            ('N?i l?c ch? y?u t?o ra t?c ??ng n?o?', ['N?ng l?n, u?n n?p, ??t g?y', 'L?m m?t kh? quy?n', 'T?ng ?? m?n bi?n', 'T?o m?a nh?n t?o'], 0),
            ('Ngo?i l?c bao g?m qu? tr?nh n?o?', ['Phong h?a, x?m th?c, b?i t?', 'Ph?ng x? m?t tr?i', 'Sinh s?n c?a sinh v?t', 'Quang h?p'], 0),
            ('??a h?nh n?i tr? th??ng li?n quan nhi?u ??n qu? tr?nh n?o?', ['V?n ??ng ki?n t?o m?nh', 'L?ng ??ng ph? sa y?n t?nh', 'B?c h?i n??c', 'Chuy?n ??ng bi?u ki?n c?a M?t Tr?i'], 0),
            ('Khi quan s?t l?p ??a h?nh minh h?a, em ?ang luy?n k? n?ng g??', ['Li?n h? qu? tr?nh t?o h?nh v?i d?ng ??a h?nh', '??c m?i gi?', 'T?nh t? l? d?n s?', 'X?c ??nh lo?i gi? m?a'], 0),
            ('N?i l?c v? ngo?i l?c c? quan h? th? n?o?', ['C?ng t?c ??ng l?m bi?n ??i b? m?t Tr?i ??t', 'Ho?n to?n kh?ng li?n quan', 'Ch? c? n?i l?c m?i quan tr?ng', 'Ch? c? ngo?i l?c m?i quan tr?ng'], 0),
            ('V? d? n?o sau ??y g?n v?i ngo?i l?c?', ['B?i t? ? c?a s?ng', 'N?ng t?o n?i', 'Phun tr?o magma', '??t g?y ki?n t?o'], 0),
        ],
    },
    {
        'code': 'module-04',
        'title': 'Kh? quy?n, nhi?t ??, kh? ?p, gi? v? m?a',
        'center': [95, 18],
        'zoom': 2.2,
        'layers': [
            ('?ai kh? ?p v? gi? ch?nh', 'line_features', 'LINESTRING', 'category', 'module_04_wind_belt'),
            ('Tr?m kh? t??ng m?u', 'points_of_interest', 'POINT', 'category', 'module_04_climate_station'),
            ('Mi?n kh? h?u minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_04_climate_zone'),
        ],
        'overview': 'C?ng c? ki?n th?c v? c?u tr?c kh? quy?n, s? ph?n b? nhi?t ??, kh? ?p, c?c ?ai gi? ch?nh v? nh?n t? t?o m?a.',
        'practice': 'D?ng WebGIS ?? so s?nh tr?m kh? t??ng, ?ai gi? v? mi?n kh? h?u khi tr? l?i c?c c?u h?i cu?i b?i.',
        'steps': [
            'Quan s?t c?c ?ai gi? ch?nh ?? ghi nh? h??ng chuy?n ??ng ph? bi?n c?a kh?ng kh?.',
            'M? c?c tr?m kh? t??ng m?u v? so s?nh th?ng tin nhi?t ??, l??ng m?a gi?a c?c v? tr?.',
            'B?t l?p mi?n kh? h?u ?? li?n h? gi?a gi?, m?a v? s? kh?c bi?t kh? h?u.',
        ],
        'questions': [
            ('Kh? ?p l? g??', ['S?c ?p c?a kh?ng kh? l?n b? m?t Tr?i ??t', '?? m?n c?a n??c bi?n', '?? d?y c?a ??t', 'L??ng ph? sa'], 0),
            ('Gi? h?nh th?nh ch? y?u do s? ch?nh l?ch n?o?', ['Kh? ?p', 'D?n s?', '?? che ph? r?ng', 'S? gi? h?c'], 0),
            ('M?a ??a h?nh th??ng xu?t hi?n khi n?o?', ['Kh?ng kh? ?m b? ??y l?n s??n n?i', 'Bi?n l?ng s?ng', '?p cao m?nh l?n', 'Tr?i quang ho?n to?n'], 0),
            ('?ai ?p th?p x?ch ??o th??ng g?n v?i ??c ?i?m n?o?', ['Kh?ng kh? b?c l?n m?nh', 'Kh? h?n quanh n?m', 'B?ng tuy?t v?nh c?u', 'Gi? t?y ?n ??i suy y?u ho?n to?n'], 0),
            ('Tr?m kh? t??ng gi?p h?c sinh quan s?t t?t nh?t d? li?u n?o?', ['Nhi?t ?? v? l??ng m?a', '??t g?y ??a ch?t', 'Lo?i ??t', '??ng ??t s?u'], 0),
            ('Mi?n kh? h?u th??ng ???c bi?u hi?n thu?n ti?n b?ng l?p n?o?', ['L?p v?ng', 'L?p ?i?m ??n l?', 'L?p b?ng thu?n v?n b?n', 'L?p ?nh kh?ng ??nh v?'], 0),
            ('Gi? th?i t? n?i n?o ??n n?i n?o?', ['T? n?i kh? ?p cao ??n n?i kh? ?p th?p', 'T? bi?n v?o r?ng m?i l?c', 'T? n?i n?ng h?n ??n n?i l?nh h?n b?t k? ?p su?t', 'Ng?u nhi?n'], 0),
            ('Khi ??i chi?u tr?m kh? t??ng v? mi?n kh? h?u, em ?ang luy?n k? n?ng g??', ['Li?n h? s? li?u ?i?m v?i v?ng ph?n h?a kh? h?u', '??c m?i gi?', 'Nh?n d?ng m?ng ki?n t?o', 'T?nh chi?u d?i s?ng'], 0),
        ],
    },
    {
        'code': 'module-05',
        'title': 'Th?y quy?n, n??c tr?n l?c ??a, n??c bi?n v? ??i d??ng',
        'center': [107.5, 15.5],
        'zoom': 4.0,
        'layers': [
            ('S?ng ch?nh minh h?a', 'routes', 'LINESTRING', 'type', 'module_05_river'),
            ('L?u v?c s?ng m?u', 'boundaries', 'MULTIPOLYGON', 'type', 'module_05_basin'),
            ('Tr?m th?y v?n m?u', 'points_of_interest', 'POINT', 'category', 'module_05_hydro_station'),
            ('V?ng bi?n v? ??i d??ng minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_05_sea_region'),
        ],
        'overview': 'N?m ???c c?c th?nh ph?n ch?nh c?a th?y quy?n, ??c ?i?m n??c tr?n l?c ??a v? m?t s? bi?u hi?n c? b?n c?a m?i tr??ng bi?n - ??i d??ng.',
        'practice': 'T? l?u v?c, tuy?n s?ng v? tr?m th?y v?n, h?c sinh luy?n quan s?t ch? ?? n??c s?ng v? m?i li?n h? v?i kh?ng gian l?u v?c.',
        'steps': [
            'B?t l?p s?ng ch?nh ?? nh?n ra h??ng ch?y v? m?ng l??i s?ng ti?u bi?u.',
            'M? l?p l?u v?c s?ng v? x?c ??nh ph?m vi thu n??c c?a t?ng h? th?ng.',
            'Quan s?t tr?m th?y v?n, sau ?? li?n h? v?i l?p v?ng bi?n ?? tr? l?i c?u h?i ng?n cu?i b?i.',
        ],
        'questions': [
            ('L?u v?c s?ng l? g??', ['Ph?n di?n t?ch cung c?p n??c cho m?t con s?ng', 'M?t ?o?n s?ng c? nhi?u th?c', 'N?i t?u thuy?n neo ??u', 'V?ng c? nhi?u ao h?'], 0),
            ('Ch? ?? n??c s?ng ch?u ?nh h??ng m?nh c?a y?u t? n?o?', ['M?a theo m?a v? ngu?n c?p n??c', 'M?u ??t', 'T?n ??a ph??ng', 'M?i gi?'], 0),
            ('Tr?m th?y v?n gi?p theo d?i n?i dung n?o?', ['M?c n??c v? l?u l??ng', 'S? l??ng ??ng ??t', '?? nghi?ng tr?c Tr?i ??t', 'H??ng gi? t?ng cao'], 0),
            ('N??c bi?n v? ??i d??ng kh?c n??c tr?n l?c ??a r? nh?t ? ??c ?i?m n?o?', ['?? m?n', 'Nhi?t ?? lu?n th?p', 'Kh?ng c? sinh v?t', 'Kh?ng ch?u t?c ??ng c?a gi?'], 0),
            ('N?u quan s?t l?p tuy?n s?ng v? l?p l?u v?c c?ng l?c, em d? nh?n ra ?i?u g??', ['Quan h? gi?a d?ng ch?y v? ph?m vi thu n??c', 'M?i gi? ??a ph??ng', 'S? ph?n b? ??t feralit', 'V? tr? ch? tuy?n'], 0),
            ('V? d? n?o thu?c n??c tr?n l?c ??a?', ['S?ng, h?, b?ng h?, n??c ng?m', 'Bi?n ??ng', 'Th?i B?nh D??ng', 'V?nh B?c B?'], 0),
            ('N??c bi?n tham gia m?nh v?o v?ng tu?n ho?n n??c qua qu? tr?nh n?o?', ['B?c h?i', 'U?n n?p ??a h?nh', '??t g?y', 'Phong h?a c? h?c'], 0),
            ('L?p v?ng bi?n trong module 05 gi?p h?c sinh l?m g??', ['Li?n h? gi?a kh?ng gian bi?n v? th?y quy?n', '??c t?a ?? n?i l?a', 'T?nh d?n s?', 'Quan s?t ?ai ?p cao'], 0),
        ],
    },
    {
        'code': 'module-06',
        'title': 'Th? nh??ng, sinh quy?n, v? ??a l?, quy lu?t ??a ??i v? phi ??a ??i',
        'center': [106.5, 16.0],
        'zoom': 3.8,
        'layers': [
            ('??i ??t minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_06_soil_zone'),
            ('??i sinh v?t minh h?a', 'polygon_features', 'POLYGON', 'category', 'module_06_biome_zone'),
            ('?i?m h? sinh th?i m?u', 'points_of_interest', 'POINT', 'category', 'module_06_ecosystem_point'),
        ],
        'overview': 'Kh?i qu?t m?i quan h? gi?a ??t, sinh v?t v? c?c th?nh ph?n t? nhi?n trong v? ??a l?; b??c ??u nh?n bi?t quy lu?t ??a ??i v? phi ??a ??i.',
        'practice': 'So s?nh l?p ??t, l?p sinh v?t v? ?i?m h? sinh th?i ?? th?y s? ph?n h?a theo ??i v? theo ?i?u ki?n ??a ph??ng.',
        'steps': [
            'M? l?p ??i ??t v? nh?n ra s? kh?c nhau gi?a c?c v?ng ??t minh h?a.',
            'B?t l?p ??i sinh v?t ?? ??i chi?u v?i l?p ??t v? ?i?u ki?n m?i tr??ng.',
            'Quan s?t c?c ?i?m h? sinh th?i r?i n?u v? d? v? bi?u hi?n ??a ??i ho?c phi ??a ??i.',
        ],
        'questions': [
            ('Th? nh??ng l? g??', ['L?p ??t tr?n b? m?t l?c ??a', 'M?t d?ng m?a', 'M?t lo?i ?? magma', 'M?t d?ng bi?n'], 0),
            ('Sinh quy?n bao g?m g??', ['To?n b? sinh v?t v? m?i tr??ng s?ng c?a ch?ng', 'Ch? ??ng v?t tr?n c?n', 'Ch? th?c v?t r?ng', 'Ch? vi khu?n trong ??t'], 0),
            ('Quy lu?t ??a ??i g?n ch? y?u v?i s? thay ??i theo y?u t? n?o?', ['V? ??', 'Kinh ??', 'T?n ??a ph??ng', 'M?i gi?'], 0),
            ('Quy lu?t phi ??a ??i th??ng g?n v?i y?u t? n?o?', ['?? cao v? ??a h?nh', 'V? ?? l? y?u t? duy nh?t', 'Chu k? ng?y ??m', 'D?ng ch?y s?ng'], 0),
            ('Khi so s?nh l?p ??t v? l?p sinh v?t, h?c sinh ?ang luy?n k? n?ng g??', ['Nh?n ra m?i li?n h? gi?a c?c th?nh ph?n t? nhi?n', '??c t?a ?? ??a l?', 'X?c ??nh h??ng gi? m?a', 'T?nh kho?ng c?ch b?n ??'], 0),
            ('V? d? n?o g?n v?i bi?u hi?n phi ??a ??i?', ['Kh?c bi?t sinh v?t theo ?ai cao tr?n n?i', 'Ph?n h?a t? x?ch ??o v? c?c', 'S? thay ??i th?i gian theo m?i gi?', 'S? lu?n phi?n ng?y ??m'], 0),
            ('V? ??a l? ???c hi?u kh?i qu?t l? g??', ['L?p v? n?i c?c th?nh ph?n t? nhi?n t?c ??ng qua l?i ch?t ch?', 'L?i Tr?i ??t', 'M?t m?ng ki?n t?o ??n l?', 'Kh? quy?n t?ng cao'], 0),
            ('?i?m h? sinh th?i m?u trong module 06 c? ?ch nh?t cho ho?t ??ng n?o?', ['Li?n h? ki?n th?c t? nhi?n v?i v? d? c? th? tr?n b?n ??', 'X?c ??nh ???ng ??t g?y', '??c m?i gi? chu?n', 'Theo d?i m?c n??c s?ng'], 0),
        ],
    },
]

CURATED_MODULE_CODES = [module['code'] for module in MODULES]
CURATED_CLASSROOM_NAME = '??a l? 10 - C?nh Di?u - HK1'


class Command(BaseCommand):
    help = 'Seed curated ??a l? 10 - C?nh Di?u - H?c k? 1 content for WebGIS.'

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
        teacher = User.objects.filter(role='teacher').order_by('id').first()
        if not teacher:
            raise RuntimeError('No teacher account found. Create a teacher before seeding HK1 content.')
        return teacher

    def upsert_classroom(self, teacher):
        classroom, _ = Classroom.objects.update_or_create(
            teacher=teacher,
            name=CURATED_CLASSROOM_NAME,
            defaults={
                **CURRICULUM,
                'module_code': '',
                'is_published': True,
            },
        )
        return classroom

    def enroll_demo_students(self, classroom):
        for student in User.objects.filter(role='student').order_by('id')[:3]:
            Enrollment.objects.get_or_create(classroom=classroom, student=student)

    def ensure_sample_geometries(self):
        self.ensure_points()
        self.ensure_lines()
        self.ensure_polygons()
        self.ensure_boundaries_and_routes()

    def ensure_points(self):
        points = [
            ('H? N?i', 'module_01_city', '?? th? trung t?m', Point(105.8342, 21.0278, srid=4326)),
            ('?? N?ng', 'module_01_city', '?? th? ven bi?n', Point(108.2022, 16.0544, srid=4326)),
            ('TP. H? Ch? Minh', 'module_01_city', '?? th? l?n ph?a Nam', Point(106.6297, 10.8231, srid=4326)),
            ('?i?m A', 'module_02_coordinate', 'M?u ??c t?a ?? g?n x?ch ??o', Point(30, 2, srid=4326)),
            ('?i?m B', 'module_02_coordinate', 'M?u ??c t?a ?? ? B?c b?n c?u', Point(105, 21, srid=4326)),
            ('?i?m C', 'module_02_coordinate', 'M?u ??c t?a ?? ? Nam b?n c?u', Point(-60, -15, srid=4326)),
            ('V?nh ?ai l?a m?u', 'module_03_hazard_point', '?i?m n?i l?a minh h?a', Point(138, 36, srid=4326)),
            ('??ng ??t m?u', 'module_03_hazard_point', '?i?m ??ng ??t minh h?a', Point(142, 38, srid=4326)),
            ('H? N?i kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n B?c', Point(105.84, 21.03, srid=4326)),
            ('Hu? kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n Trung', Point(107.58, 16.46, srid=4326)),
            ('C?n Th? kh? t??ng', 'module_04_climate_station', 'Tr?m kh? t??ng mi?n Nam', Point(105.78, 10.03, srid=4326)),
            ('Tr?m S?n T?y', 'module_05_hydro_station', 'Tr?m th?y v?n minh h?a', Point(105.51, 21.14, srid=4326)),
            ('Tr?m Vi?t Tr?', 'module_05_hydro_station', 'Theo d?i m?c n??c s?ng', Point(105.41, 21.32, srid=4326)),
            ('R?ng ng?p m?n C? Mau', 'module_06_ecosystem_point', 'H? sinh th?i ven bi?n', Point(105.15, 8.75, srid=4326)),
            ('V??n qu?c gia C?c Ph??ng', 'module_06_ecosystem_point', 'H? sinh th?i r?ng nhi?t ??i', Point(105.61, 20.35, srid=4326)),
        ]
        for name, category, description, geometry in points:
            PointOfInterest.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': description, 'geometry': geometry},
            )

    def ensure_lines(self):
        lines = [
            ('Tr?c giao th?ng B?c - Nam', 'module_01_route', 'Tuy?n giao th?ng minh h?a', [(105.84, 21.02), (108.2, 16.05), (106.63, 10.82)]),
            ('X?ch ??o', 'module_02_reference_lines', 'V? tuy?n 0 ??', [(-180, 0), (180, 0)]),
            ('Kinh tuy?n g?c', 'module_02_reference_lines', 'Kinh tuy?n 0 ??', [(0, -80), (0, 80)]),
            ('Ch? tuy?n B?c', 'module_02_reference_lines', 'V? tuy?n 23 ?? 27 ph?t B?c', [(-180, 23.5), (180, 23.5)]),
            ('Ranh gi?i m?ng Th?i B?nh D??ng', 'module_03_plate_boundary', 'Ranh gi?i m?ng ki?n t?o minh h?a', [(130, 35), (140, 30), (150, 20)]),
            ('Ranh gi?i m?ng ? - ?u', 'module_03_plate_boundary', 'Ranh gi?i m?ng ki?n t?o minh h?a', [(80, 35), (95, 30), (105, 27)]),
            ('T?n phong B?c b?n c?u', 'module_04_wind_belt', '?ai gi? ch?nh', [(-60, 30), (-20, 20), (20, 10)]),
            ('T?n phong Nam b?n c?u', 'module_04_wind_belt', '?ai gi? ch?nh', [(-50, -25), (-10, -15), (30, -5)]),
            ('Gi? t?y ?n ??i', 'module_04_wind_belt', '?ai gi? ch?nh', [(-80, 45), (-20, 50), (40, 55)]),
        ]
        for name, category, description, coords in lines:
            LineFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': description, 'geometry': LineString(coords, srid=4326)},
            )

    def ensure_polygons(self):
        polygons = [
            ('V?ng bi?u hi?n n?ng nghi?p', 'module_01_region', 'V? d? v?ng tr?n b?n ??', [(104, 21), (107, 21), (107, 18), (104, 18), (104, 21)]),
            ('UTC+7 minh h?a', 'module_02_timezone', 'V?ng m?i gi? minh h?a', [(97.5, -10), (112.5, -10), (112.5, 35), (97.5, 35), (97.5, -10)]),
            ('Mi?n n?i tr?', 'module_03_landform', 'D?ng ??a h?nh ch?u t?c ??ng ki?n t?o', [(99, 29), (106, 29), (106, 23), (99, 23), (99, 29)]),
            ('??ng b?ng b?i t?', 'module_03_landform', 'D?ng ??a h?nh do ngo?i l?c', [(105, 11.5), (108, 11.5), (108, 9.5), (105, 9.5), (105, 11.5)]),
            ('Mi?n kh? h?u nhi?t ??i ?m', 'module_04_climate_zone', 'Mi?n kh? h?u minh h?a', [(101, 22), (110, 22), (110, 8), (101, 8), (101, 22)]),
            ('Bi?n ??ng minh h?a', 'module_05_sea_region', 'Kh?ng gian bi?n minh h?a', [(106, 21), (120, 21), (120, 7), (106, 7), (106, 21)]),
            ('??t feralit', 'module_06_soil_zone', '??i ??t minh h?a', [(103.5, 21), (110.5, 21), (110.5, 11), (103.5, 11), (103.5, 21)]),
            ('??t ph? sa', 'module_06_soil_zone', '??i ??t minh h?a', [(105, 11), (107.2, 11), (107.2, 9), (105, 9), (105, 11)]),
            ('R?ng nhi?t ??i ?m', 'module_06_biome_zone', '??i sinh v?t minh h?a', [(103.5, 19), (111, 19), (111, 10), (103.5, 10), (103.5, 19)]),
            ('Sinh v?t n?i cao', 'module_06_biome_zone', 'Bi?u hi?n phi ??a ??i theo ?? cao', [(103.8, 23.5), (105.5, 23.5), (105.5, 21.8), (103.8, 21.8), (103.8, 23.5)]),
        ]
        for name, category, description, coords in polygons:
            PolygonFeature.objects.update_or_create(
                name=name,
                category=category,
                defaults={'description': description, 'geometry': Polygon(coords, srid=4326)},
            )

    def ensure_boundaries_and_routes(self):
        basin = Polygon([(103.5, 23.3), (106.7, 23.3), (106.7, 20.1), (103.5, 20.1), (103.5, 23.3)], srid=4326)
        Boundary.objects.update_or_create(
            name='L?u v?c s?ng H?ng',
            type='module_05_basin',
            defaults={'code': 'LVSH', 'geometry': MultiPolygon(basin, srid=4326)},
        )

        routes = [
            ('S?ng H?ng', 'module_05_river', [(103.9, 22.5), (104.8, 21.8), (105.6, 21.1), (106.2, 20.8)]),
            ('S?ng ??', 'module_05_river', [(103.3, 22.0), (104.5, 21.4), (105.4, 21.0)]),
            ('S?ng Ti?n', 'module_05_river', [(105.0, 10.7), (106.2, 10.4), (106.8, 10.2)]),
        ]
        for name, route_type, coords in routes:
            Route.objects.update_or_create(
                name=name,
                type=route_type,
                defaults={'length_km': len(coords) * 120, 'geometry': LineString(coords, srid=4326)},
            )

    def upsert_layers(self, module):
        layers = []
        for name, table_name, geom_type, filter_column, filter_value in module['layers']:
            layer, _ = MapLayer.objects.update_or_create(
                name=name,
                data_source_table=table_name,
                defaults={
                    'geom_type': geom_type,
                    'description': f'Layer h?c t?p cho {module["title"]}',
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
        suffix = 'T?ng quan' if lesson_type == 'overview' else 'Th?c h?nh WebGIS'
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
        actions = [
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_off': 'all'}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'], 'layers_on': [layer.id for layer in layers[:2]]}),
            MapAction.objects.create(action_type='flyTo', payload={'center': module['center'], 'zoom': module['zoom'] + zoom_boost, 'layers_on': [layer.id for layer in layers]}),
        ]
        texts = module['steps'].copy()
        if lesson_type == 'practice':
            texts[0] = f'Kh?i ??ng b?i th?c h?nh WebGIS cho {module["title"].lower()}.'
        for order, (text, action) in enumerate(zip(texts, actions), start=1):
            LessonStep.objects.create(lesson=lesson, order=order, popup_text=text, map_action=action)

    def upsert_quiz(self, module, lesson, classroom):
        quiz, _ = Quiz.objects.update_or_create(
            title=f'Quiz - {module["title"]}',
            module_code=module['code'],
            defaults={
                'lesson': lesson,
                'classroom': classroom,
                'description': f'B?i quiz c?ng c? ki?n th?c cho {module["title"].lower()}.',
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
            title=f'[HK1] {module["title"]} - b?i th?c h?nh',
            defaults={
                'description': 'M? b?i th?c h?nh WebGIS, quan s?t ?? layer c?t l?i r?i tr? l?i ph?n ghi ch? ng?n.',
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
            title=f'[HK1] {module["title"]} - quiz c?ng c?',
            defaults={
                'description': 'L?m quiz c?ng c? sau khi h?c xong module.',
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
        Lesson.objects.filter(
            grade_level=CURRICULUM['grade_level'],
            semester=CURRICULUM['semester'],
            textbook_series=CURRICULUM['textbook_series'],
        ).exclude(id__in=curated_lesson_ids).update(is_published=False)

        Quiz.objects.filter(
            grade_level=CURRICULUM['grade_level'],
            semester=CURRICULUM['semester'],
            textbook_series=CURRICULUM['textbook_series'],
        ).exclude(id__in=curated_quiz_ids).update(is_published=False)

        Classroom.objects.filter(
            grade_level=CURRICULUM['grade_level'],
            semester=CURRICULUM['semester'],
            textbook_series=CURRICULUM['textbook_series'],
        ).exclude(id=classroom.id).update(is_published=False)

        Assignment.objects.filter(classroom=classroom).exclude(id__in=curated_assignment_ids).delete()

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
