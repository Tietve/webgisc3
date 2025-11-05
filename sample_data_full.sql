-- ============================================
-- WebGIS Sample Data - Import vào pgAdmin
-- ============================================
-- Hướng dẫn:
-- 1. Mở pgAdmin → kết nối database webgis_db
-- 2. Click chuột phải vào webgis_db → Query Tool
-- 3. Copy toàn bộ file này và paste vào
-- 4. Click Execute (F5) để chạy
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 1. USERS (Tài khoản người dùng)
-- ============================================
-- Xóa dữ liệu cũ (nếu có)
TRUNCATE TABLE users_user CASCADE;

-- Insert users với password đã hash (password: admin123, teacher123, student123)
INSERT INTO users_user (id, password, last_login, is_superuser, email, role, is_active, is_staff, date_joined, created_at, updated_at)
VALUES
    -- Admin user (email: admin@webgis.com, password: admin123)
    ('11111111-1111-1111-1111-111111111111',
     'pbkdf2_sha256$600000$salt123$FakeHashForDemo1234567890abcdefghijklmnopqrstuvwxyz=',
     NULL, true, 'admin@webgis.com', 'teacher', true, true, NOW(), NOW(), NOW()),

    -- Teacher (email: teacher@webgis.com, password: teacher123)
    ('22222222-2222-2222-2222-222222222222',
     'pbkdf2_sha256$600000$salt456$FakeHashForDemo1234567890abcdefghijklmnopqrstuvwxyz=',
     NULL, false, 'teacher@webgis.com', 'teacher', true, true, NOW(), NOW(), NOW()),

    -- Student 1 (email: student1@webgis.com, password: student123)
    ('33333333-3333-3333-3333-333333333333',
     'pbkdf2_sha256$600000$salt789$FakeHashForDemo1234567890abcdefghijklmnopqrstuvwxyz=',
     NULL, false, 'student1@webgis.com', 'student', true, false, NOW(), NOW(), NOW()),

    -- Student 2 (email: student2@webgis.com, password: student123)
    ('44444444-4444-4444-4444-444444444444',
     'pbkdf2_sha256$600000$saltabc$FakeHashForDemo1234567890abcdefghijklmnopqrstuvwxyz=',
     NULL, false, 'student2@webgis.com', 'student', true, false, NOW(), NOW(), NOW());

-- ============================================
-- 2. CLASSROOMS (Lớp học)
-- ============================================
TRUNCATE TABLE classrooms_classroom CASCADE;

INSERT INTO classrooms_classroom (id, name, enrollment_code, created_at, updated_at, teacher_id)
VALUES
    (1, 'Địa lý Việt Nam 11', 'GIS2024', NOW(), NOW(), '22222222-2222-2222-2222-222222222222');

-- ============================================
-- 3. ENROLLMENTS (Đăng ký lớp học)
-- ============================================
TRUNCATE TABLE classrooms_enrollment CASCADE;

INSERT INTO classrooms_enrollment (id, enrolled_at, classroom_id, student_id)
VALUES
    (1, NOW(), 1, '33333333-3333-3333-3333-333333333333'),
    (2, NOW(), 1, '44444444-4444-4444-4444-444444444444');

-- ============================================
-- 4. MAP LAYERS (Lớp bản đồ)
-- ============================================
TRUNCATE TABLE gis_data_maplayer CASCADE;

INSERT INTO gis_data_maplayer (id, name, data_source_table, geom_type, description, is_active, created_at, updated_at)
VALUES
    (1, 'Tỉnh thành Việt Nam', 'vietnam_provinces', 'MULTIPOLYGON',
     'Administrative boundaries of Vietnam provinces', true, NOW(), NOW());

-- ============================================
-- 5. VIETNAM PROVINCES (Tỉnh thành VN với geometry)
-- ============================================
TRUNCATE TABLE gis_data_vietnamprovince CASCADE;

INSERT INTO gis_data_vietnamprovince (id, name, name_en, code, region, population, area_km2, geometry)
VALUES
    -- Hà Nội
    (1, 'Hà Nội', 'Hanoi', 'HN', 'North', 8053663, 3328.9,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.7,21.1],[105.9,21.1],[105.9,20.9],[105.7,20.9],[105.7,21.1]]]]}')),

    -- Hồ Chí Minh
    (2, 'Hồ Chí Minh', 'Ho Chi Minh City', 'HCM', 'South', 8993082, 2061.0,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.5,10.9],[106.9,10.9],[106.9,10.5],[106.5,10.5],[106.5,10.9]]]]}')),

    -- Đà Nẵng
    (3, 'Đà Nẵng', 'Da Nang', 'DN', 'Central', 1134310, 1285.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.9,16.2],[108.3,16.2],[108.3,15.8],[107.9,15.8],[107.9,16.2]]]]}')),

    -- Hải Phòng
    (4, 'Hải Phòng', 'Hai Phong', 'HP', 'North', 2028514, 1527.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.5,20.9],[106.9,20.9],[106.9,20.5],[106.5,20.5],[106.5,20.9]]]]}')),

    -- Cần Thơ
    (5, 'Cần Thơ', 'Can Tho', 'CT', 'South', 1282095, 1409.0,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.5,10.2],[105.9,10.2],[105.9,9.8],[105.5,9.8],[105.5,10.2]]]]}'));

-- ============================================
-- 6. LESSONS (Bài học)
-- ============================================
TRUNCATE TABLE lessons_lesson CASCADE;

INSERT INTO lessons_lesson (id, title, description, created_at, updated_at)
VALUES
    (1, 'Khám phá bản đồ Việt Nam', 'Bài học tương tác về các tỉnh thành Việt Nam', NOW(), NOW());

-- ============================================
-- 7. MAP ACTIONS (Hành động bản đồ)
-- ============================================
TRUNCATE TABLE lessons_mapaction CASCADE;

INSERT INTO lessons_mapaction (id, action_type, payload)
VALUES
    (1, 'ZOOM_TO', '{"center": [106.0, 16.0], "zoom": 6}'),
    (2, 'TOGGLE_LAYER', '{"layer_id": 1, "visible": true}'),
    (3, 'ZOOM_TO', '{"center": [105.8, 21.0], "zoom": 10}');

-- ============================================
-- 8. LESSON STEPS (Các bước trong bài học)
-- ============================================
TRUNCATE TABLE lessons_lessonstep CASCADE;

INSERT INTO lessons_lessonstep (id, "order", popup_text, lesson_id, map_action_id)
VALUES
    (1, 1, 'Chào mừng bạn đến với bài học về bản đồ Việt Nam! Hãy quan sát toàn cảnh đất nước.', 1, 1),
    (2, 2, 'Đây là bản đồ hành chính Việt Nam với các tỉnh thành. Hãy xem các ranh giới tỉnh.', 1, 2),
    (3, 3, 'Đây là thủ đô Hà Nội - trung tâm chính trị của Việt Nam. Diện tích: 3,328.9 km².', 1, 3);

-- ============================================
-- 9. QUIZZES (Bài kiểm tra)
-- ============================================
TRUNCATE TABLE quizzes_quiz CASCADE;

INSERT INTO quizzes_quiz (id, title, description, time_limit_minutes, passing_score, created_at, updated_at, classroom_id)
VALUES
    (1, 'Kiểm tra kiến thức Địa lý Việt Nam', 'Bài kiểm tra về các tỉnh thành Việt Nam',
     30, 60.00, NOW(), NOW(), 1);

-- ============================================
-- 10. QUIZ QUESTIONS (Câu hỏi)
-- ============================================
TRUNCATE TABLE quizzes_quizquestion CASCADE;

INSERT INTO quizzes_quizquestion (id, question_text, points, "order", quiz_id)
VALUES
    (1, 'Thủ đô của Việt Nam là gì?', 10.00, 1, 1),
    (2, 'Thành phố nào có dân số đông nhất Việt Nam?', 10.00, 2, 1),
    (3, 'Thành phố nào nằm ở miền Trung Việt Nam?', 10.00, 3, 1);

-- ============================================
-- 11. QUIZ ANSWERS (Đáp án)
-- ============================================
TRUNCATE TABLE quizzes_quizanswer CASCADE;

INSERT INTO quizzes_quizanswer (id, answer_text, is_correct, question_id)
VALUES
    -- Câu 1: Thủ đô của Việt Nam
    (1, 'Hồ Chí Minh', false, 1),
    (2, 'Hà Nội', true, 1),
    (3, 'Đà Nẵng', false, 1),
    (4, 'Hải Phòng', false, 1),

    -- Câu 2: Dân số đông nhất
    (5, 'Hà Nội', false, 2),
    (6, 'Hồ Chí Minh', true, 2),
    (7, 'Đà Nẵng', false, 2),
    (8, 'Cần Thơ', false, 2),

    -- Câu 3: Miền Trung
    (9, 'Hà Nội', false, 3),
    (10, 'Hồ Chí Minh', false, 3),
    (11, 'Đà Nẵng', true, 3),
    (12, 'Cần Thơ', false, 3);

-- ============================================
-- 12. BONUS: Thêm dữ liệu GIS mẫu
-- ============================================

-- Tạo bảng points_of_interest (nếu chưa có)
CREATE TABLE IF NOT EXISTS points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(Point, 4326)
);

-- Tạo spatial index
CREATE INDEX IF NOT EXISTS idx_poi_geometry
ON points_of_interest USING GIST (geometry);

-- Insert điểm mẫu
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Hồ Hoàn Kiếm', 'Hồ nước', 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0285]}')),

    ('Chợ Bến Thành', 'Chợ', 'Chợ truyền thống lớn nhất TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981, 10.7720]}')),

    ('Phố cổ Hội An', 'Di tích', 'Khu phố cổ được UNESCO công nhận',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.3277, 15.8801]}')),

    ('Cầu Rồng', 'Cầu', 'Cầu có hình rồng nổi tiếng Đà Nẵng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2272, 16.0544]}')),

    ('Nhà thờ Đức Bà', 'Nhà thờ', 'Nhà thờ cổ ở trung tâm Sài Gòn',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6990, 10.7797]}'));

-- Tạo bảng routes (tuyến đường)
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    length_km DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(LineString, 4326)
);

CREATE INDEX IF NOT EXISTS idx_routes_geometry
ON routes USING GIST (geometry);

-- Insert tuyến đường mẫu
INSERT INTO routes (name, type, length_km, geometry)
VALUES
    ('Tuyến Bus 01 - Hà Nội', 'Bus', 12.5,
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[105.8234,21.0589],[105.8456,21.0334],[105.8527,21.0285]]}')),

    ('Tuyến Metro số 1 - TP.HCM', 'Metro', 19.7,
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[106.6296,10.8231],[106.6780,10.7821],[106.7175,10.7645]]}'));

-- Tạo bảng boundaries (ranh giới)
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

CREATE INDEX IF NOT EXISTS idx_boundaries_geometry
ON boundaries USING GIST (geometry);

-- ============================================
-- Reset sequences để ID tiếp theo đúng
-- ============================================
SELECT setval('classrooms_classroom_id_seq', (SELECT MAX(id) FROM classrooms_classroom));
SELECT setval('classrooms_enrollment_id_seq', (SELECT MAX(id) FROM classrooms_enrollment));
SELECT setval('gis_data_maplayer_id_seq', (SELECT MAX(id) FROM gis_data_maplayer));
SELECT setval('gis_data_vietnamprovince_id_seq', (SELECT MAX(id) FROM gis_data_vietnamprovince));
SELECT setval('lessons_lesson_id_seq', (SELECT MAX(id) FROM lessons_lesson));
SELECT setval('lessons_mapaction_id_seq', (SELECT MAX(id) FROM lessons_mapaction));
SELECT setval('lessons_lessonstep_id_seq', (SELECT MAX(id) FROM lessons_lessonstep));
SELECT setval('quizzes_quiz_id_seq', (SELECT MAX(id) FROM quizzes_quiz));
SELECT setval('quizzes_quizquestion_id_seq', (SELECT MAX(id) FROM quizzes_quizquestion));
SELECT setval('quizzes_quizanswer_id_seq', (SELECT MAX(id) FROM quizzes_quizanswer));
SELECT setval('points_of_interest_id_seq', (SELECT MAX(id) FROM points_of_interest));
SELECT setval('routes_id_seq', (SELECT MAX(id) FROM routes));

-- ============================================
-- HOÀN TẤT!
-- ============================================

-- Kiểm tra dữ liệu đã import
SELECT
    (SELECT COUNT(*) FROM users_user) as users,
    (SELECT COUNT(*) FROM classrooms_classroom) as classrooms,
    (SELECT COUNT(*) FROM classrooms_enrollment) as enrollments,
    (SELECT COUNT(*) FROM gis_data_vietnamprovince) as provinces,
    (SELECT COUNT(*) FROM lessons_lesson) as lessons,
    (SELECT COUNT(*) FROM lessons_lessonstep) as lesson_steps,
    (SELECT COUNT(*) FROM quizzes_quiz) as quizzes,
    (SELECT COUNT(*) FROM quizzes_quizquestion) as quiz_questions,
    (SELECT COUNT(*) FROM points_of_interest) as poi,
    (SELECT COUNT(*) FROM routes) as routes;

-- In thông báo thành công
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORT DỮ LIỆU THÀNH CÔNG!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tài khoản đã tạo:';
    RAISE NOTICE '  - admin@webgis.com (Admin)';
    RAISE NOTICE '  - teacher@webgis.com (Teacher)';
    RAISE NOTICE '  - student1@webgis.com (Student)';
    RAISE NOTICE '  - student2@webgis.com (Student)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ LƯU Ý: Password cần được reset!';
    RAISE NOTICE 'Chạy lệnh sau để tạo password:';
    RAISE NOTICE '  docker exec -it webgis_backend python manage.py shell';
    RAISE NOTICE 'Rồi trong shell chạy:';
    RAISE NOTICE '  from apps.users.models import User';
    RAISE NOTICE '  User.objects.get(email="admin@webgis.com").set_password("admin123")';
    RAISE NOTICE '  User.objects.get(email="admin@webgis.com").save()';
    RAISE NOTICE '========================================';
END $$;
