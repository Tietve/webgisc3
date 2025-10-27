# Hướng Dẫn Thêm Dữ Liệu Vào Các Bảng Có Sẵn

## ✅ Trạng Thái Hệ Thống

Database đã có sẵn các bảng sau:
- `users` - Người dùng
- `classrooms` - Lớp học
- `enrollments` - Đăng ký lớp học
- `lessons` - Bài học
- `lesson_steps` - Các bước trong bài học
- `map_actions` - Hành động trên bản đồ
- `quizzes` - Bài kiểm tra
- `quiz_questions` - Câu hỏi
- `quiz_answers` - Câu trả lời
- `quiz_submissions` - Bài nộp

## Bước 1: Truy Cập pgAdmin

1. Mở trình duyệt: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@webgis.com`
   - Password: `admin123`

## Bước 2: Kết Nối Database (Nếu Chưa Làm)

1. Click chuột phải **Servers** → **Create** → **Server**
2. **Tab General**: Name = `WebGIS Database`
3. **Tab Connection**:
   - Host: `db`
   - Port: `5432`
   - Database: `webgis_db`
   - Username: `webgis_user`
   - Password: `webgis_password`
   - ✓ Save password
4. Click **Save**

## Bước 3: Xem Cấu Trúc Bảng

Để xem cấu trúc của một bảng trước khi thêm dữ liệu:

1. Mở rộng: **Servers** → **WebGIS Database** → **Databases** → **webgis_db** → **Schemas** → **public** → **Tables**
2. Click chuột phải vào bảng (VD: `users`) → **Properties** → **Columns**
3. Xem danh sách các cột và kiểu dữ liệu

## Bước 4: Mở Query Tool

1. Click chuột phải vào **webgis_db** → **Query Tool**
2. Cửa sổ SQL editor sẽ mở ra

## Bước 5: Thêm Dữ Liệu Vào Các Bảng

### 1. Thêm Người Dùng (Users)

Trước tiên, hãy xem cấu trúc bảng users:

```sql
-- Xem cấu trúc bảng
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Thêm người dùng mới:

```sql
-- Thêm 1 người dùng
INSERT INTO users (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    role
) VALUES (
    'pbkdf2_sha256$600000$dummy$hash',  -- Password hash (cần tạo đúng)
    NULL,                                -- Chưa đăng nhập
    FALSE,                               -- Không phải superuser
    'student01',                         -- Tên đăng nhập
    'Nguyen',                            -- Họ
    'Van A',                             -- Tên
    'student01@example.com',             -- Email
    FALSE,                               -- Không phải staff
    TRUE,                                -- Tài khoản active
    NOW(),                               -- Ngày tạo
    'student'                            -- Vai trò: student/teacher/admin
);

-- Thêm nhiều người dùng cùng lúc
INSERT INTO users (password, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined, role)
VALUES
    ('pbkdf2_sha256$600000$dummy$hash', FALSE, 'student02', 'Tran', 'Thi B', 'student02@example.com', FALSE, TRUE, NOW(), 'student'),
    ('pbkdf2_sha256$600000$dummy$hash', FALSE, 'student03', 'Le', 'Van C', 'student03@example.com', FALSE, TRUE, NOW(), 'student'),
    ('pbkdf2_sha256$600000$dummy$hash', FALSE, 'teacher01', 'Pham', 'Thi D', 'teacher01@example.com', TRUE, TRUE, NOW(), 'teacher');
```

**Lưu ý về Password:**
- Password trên là hash giả, cần tạo password thật qua Django admin hoặc script
- Hoặc dùng lệnh sau để tạo user với password đúng:

```sql
-- Tạo superuser để vào Django Admin
-- Chạy trong terminal:
-- docker exec webgis_backend python manage.py createsuperuser
```

### 2. Thêm Lớp Học (Classrooms)

```sql
-- Xem cấu trúc bảng
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'classrooms'
ORDER BY ordinal_position;

-- Thêm lớp học
INSERT INTO classrooms (
    name,
    description,
    created_at,
    updated_at,
    teacher_id  -- ID của giáo viên (phải tồn tại trong bảng users)
) VALUES (
    'GIS Cơ Bản 101',
    'Khóa học GIS dành cho người mới bắt đầu',
    NOW(),
    NOW(),
    (SELECT id FROM users WHERE username = 'teacher01' LIMIT 1)
);

-- Thêm nhiều lớp
INSERT INTO classrooms (name, description, created_at, updated_at, teacher_id)
VALUES
    ('GIS Nâng Cao 201', 'Khóa học GIS nâng cao', NOW(), NOW(),
     (SELECT id FROM users WHERE username = 'teacher01' LIMIT 1)),
    ('Web GIS 301', 'Phát triển ứng dụng Web GIS', NOW(), NOW(),
     (SELECT id FROM users WHERE username = 'teacher01' LIMIT 1));
```

### 3. Thêm Đăng Ký Lớp Học (Enrollments)

```sql
-- Thêm học sinh vào lớp
INSERT INTO enrollments (
    student_id,
    classroom_id,
    enrolled_at
) VALUES (
    (SELECT id FROM users WHERE username = 'student01'),
    (SELECT id FROM classrooms WHERE name = 'GIS Cơ Bản 101'),
    NOW()
);

-- Thêm nhiều học sinh vào lớp
INSERT INTO enrollments (student_id, classroom_id, enrolled_at)
SELECT
    u.id,
    (SELECT id FROM classrooms WHERE name = 'GIS Cơ Bản 101'),
    NOW()
FROM users u
WHERE u.role = 'student';
```

### 4. Thêm Bài Học (Lessons)

```sql
-- Thêm bài học
INSERT INTO lessons (
    title,
    description,
    order_index,
    created_at,
    updated_at,
    classroom_id
) VALUES (
    'Bài 1: Giới thiệu GIS',
    'Tìm hiểu khái niệm cơ bản về GIS và ứng dụng',
    1,
    NOW(),
    NOW(),
    (SELECT id FROM classrooms WHERE name = 'GIS Cơ Bản 101')
);

-- Thêm nhiều bài học
INSERT INTO lessons (title, description, order_index, created_at, updated_at, classroom_id)
VALUES
    ('Bài 2: Hệ tọa độ và Projection', 'Tìm hiểu về hệ tọa độ địa lý', 2, NOW(), NOW(),
     (SELECT id FROM classrooms WHERE name = 'GIS Cơ Bản 101')),
    ('Bài 3: Dữ liệu Vector và Raster', 'Phân biệt hai loại dữ liệu GIS', 3, NOW(), NOW(),
     (SELECT id FROM classrooms WHERE name = 'GIS Cơ Bản 101'));
```

### 5. Thêm Các Bước Trong Bài Học (Lesson Steps)

```sql
-- Thêm bước học
INSERT INTO lesson_steps (
    lesson_id,
    step_type,
    title,
    content,
    order_index,
    map_center_lat,
    map_center_lng,
    map_zoom
) VALUES (
    (SELECT id FROM lessons WHERE title = 'Bài 1: Giới thiệu GIS'),
    'lecture',                    -- Loại: lecture, exercise, quiz
    'Khái niệm GIS',
    '<h2>GIS là gì?</h2><p>GIS (Geographic Information System) là hệ thống thông tin địa lý...</p>',
    1,
    21.0285,                      -- Vĩ độ center map (Hà Nội)
    105.8542,                     -- Kinh độ center map
    12                            -- Zoom level
);

-- Thêm nhiều bước
INSERT INTO lesson_steps (lesson_id, step_type, title, content, order_index, map_center_lat, map_center_lng, map_zoom)
VALUES
    ((SELECT id FROM lessons WHERE title = 'Bài 1: Giới thiệu GIS'),
     'exercise', 'Thực hành: Xem bản đồ',
     '<p>Hãy zoom vào khu vực Hà Nội và tìm Hồ Hoàn Kiếm</p>',
     2, 21.0285, 105.8542, 14),

    ((SELECT id FROM lessons WHERE title = 'Bài 1: Giới thiệu GIS'),
     'quiz', 'Kiểm tra kiến thức',
     '<p>Trả lời các câu hỏi sau</p>',
     3, NULL, NULL, NULL);
```

### 6. Thêm Bài Kiểm Tra (Quizzes)

```sql
-- Thêm quiz
INSERT INTO quizzes (
    title,
    description,
    lesson_id,
    passing_score,
    time_limit_minutes,
    created_at
) VALUES (
    'Quiz: Kiến thức cơ bản GIS',
    'Kiểm tra hiểu biết về GIS',
    (SELECT id FROM lessons WHERE title = 'Bài 1: Giới thiệu GIS'),
    70,           -- Điểm đạt: 70%
    15,           -- Thời gian: 15 phút
    NOW()
);
```

### 7. Thêm Câu Hỏi (Quiz Questions)

```sql
-- Thêm câu hỏi
INSERT INTO quiz_questions (
    quiz_id,
    question_text,
    question_type,
    order_index,
    points
) VALUES (
    (SELECT id FROM quizzes WHERE title = 'Quiz: Kiến thức cơ bản GIS'),
    'GIS là viết tắt của gì?',
    'multiple_choice',
    1,
    10
);

-- Thêm nhiều câu hỏi
INSERT INTO quiz_questions (quiz_id, question_text, question_type, order_index, points)
VALUES
    ((SELECT id FROM quizzes WHERE title = 'Quiz: Kiến thức cơ bản GIS'),
     'Dữ liệu vector bao gồm những loại nào?',
     'multiple_choice', 2, 10),

    ((SELECT id FROM quizzes WHERE title = 'Quiz: Kiến thức cơ bản GIS'),
     'SRID 4326 là hệ tọa độ gì?',
     'text', 3, 10);
```

### 8. Thêm Câu Trả Lời (Quiz Answers)

```sql
-- Thêm các lựa chọn cho câu hỏi multiple choice
INSERT INTO quiz_answers (
    question_id,
    answer_text,
    is_correct,
    order_index
) VALUES
    -- Câu 1: GIS là gì
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'GIS là viết tắt%'),
     'Geographic Information System', TRUE, 1),
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'GIS là viết tắt%'),
     'Global Information System', FALSE, 2),
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'GIS là viết tắt%'),
     'General Information Service', FALSE, 3),

    -- Câu 2: Dữ liệu vector
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'Dữ liệu vector%'),
     'Point, Line, Polygon', TRUE, 1),
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'Dữ liệu vector%'),
     'Pixel, Grid', FALSE, 2),
    ((SELECT id FROM quiz_questions WHERE question_text LIKE 'Dữ liệu vector%'),
     'Raster, Image', FALSE, 3);
```

### 9. Thêm Hành Động Bản Đồ (Map Actions)

```sql
-- Thêm hành động của học sinh trên bản đồ
INSERT INTO map_actions (
    user_id,
    lesson_step_id,
    action_type,
    action_data,
    created_at
) VALUES (
    (SELECT id FROM users WHERE username = 'student01'),
    (SELECT id FROM lesson_steps WHERE title = 'Thực hành: Xem bản đồ'),
    'zoom',
    '{"zoom_level": 15, "lat": 21.0285, "lng": 105.8542}',
    NOW()
);

-- Thêm nhiều hành động
INSERT INTO map_actions (user_id, lesson_step_id, action_type, action_data, created_at)
VALUES
    ((SELECT id FROM users WHERE username = 'student01'),
     (SELECT id FROM lesson_steps WHERE title = 'Thực hành: Xem bản đồ'),
     'click', '{"lat": 21.0285, "lng": 105.8542}', NOW()),

    ((SELECT id FROM users WHERE username = 'student01'),
     (SELECT id FROM lesson_steps WHERE title = 'Thực hành: Xem bản đồ'),
     'pan', '{"from": {"lat": 21.0285, "lng": 105.8542}, "to": {"lat": 21.03, "lng": 105.86}}', NOW());
```

## Bước 6: Kiểm Tra Dữ Liệu Đã Thêm

### Xem tất cả người dùng

```sql
SELECT id, username, first_name, last_name, email, role
FROM users
ORDER BY id;
```

### Xem lớp học và giáo viên

```sql
SELECT
    c.id,
    c.name,
    c.description,
    u.username as teacher_name
FROM classrooms c
JOIN users u ON c.teacher_id = u.id
ORDER BY c.id;
```

### Xem học sinh trong lớp

```sql
SELECT
    c.name as classroom,
    u.username,
    u.first_name,
    u.last_name,
    e.enrolled_at
FROM enrollments e
JOIN classrooms c ON e.classroom_id = c.id
JOIN users u ON e.student_id = u.id
ORDER BY c.name, u.username;
```

### Xem bài học và các bước

```sql
SELECT
    l.title as lesson,
    ls.step_type,
    ls.title as step_title,
    ls.order_index
FROM lessons l
LEFT JOIN lesson_steps ls ON l.id = ls.lesson_id
ORDER BY l.order_index, ls.order_index;
```

### Xem quiz và câu hỏi

```sql
SELECT
    q.title as quiz_title,
    qq.question_text,
    qq.question_type,
    qa.answer_text,
    qa.is_correct
FROM quizzes q
JOIN quiz_questions qq ON q.id = qq.quiz_id
LEFT JOIN quiz_answers qa ON qq.id = qa.question_id
ORDER BY q.id, qq.order_index, qa.order_index;
```

## Bước 7: Sửa/Xóa Dữ Liệu

### Sửa dữ liệu

```sql
-- Sửa tên người dùng
UPDATE users
SET first_name = 'Nguyen Van', last_name = 'Minh'
WHERE username = 'student01';

-- Sửa mô tả lớp học
UPDATE classrooms
SET description = 'Khóa học GIS cơ bản - Phiên bản mới'
WHERE name = 'GIS Cơ Bản 101';
```

### Xóa dữ liệu

```sql
-- Xóa enrollment
DELETE FROM enrollments
WHERE student_id = (SELECT id FROM users WHERE username = 'student03');

-- Xóa câu hỏi (sẽ tự động xóa answers nếu có CASCADE)
DELETE FROM quiz_questions
WHERE id = 5;
```

## Tips và Lưu Ý

### 1. Foreign Keys

Khi thêm dữ liệu, phải đảm bảo các foreign key tồn tại:
- `classroom.teacher_id` phải tồn tại trong `users`
- `enrollment.student_id` phải tồn tại trong `users`
- `lesson.classroom_id` phải tồn tại trong `classrooms`

### 2. Sử dụng Subquery

Thay vì nhập ID trực tiếp, dùng subquery an toàn hơn:

```sql
-- ❌ Không tốt
INSERT INTO classrooms (name, teacher_id) VALUES ('Lớp A', 5);

-- ✅ Tốt hơn
INSERT INTO classrooms (name, teacher_id)
VALUES ('Lớp A', (SELECT id FROM users WHERE username = 'teacher01'));
```

### 3. Kiểm Tra Dữ Liệu Trước Khi Xóa

```sql
-- Kiểm tra xem lớp có học sinh không trước khi xóa
SELECT COUNT(*) FROM enrollments WHERE classroom_id = 1;
```

### 4. Transaction

Nếu thêm nhiều dữ liệu liên quan, dùng transaction:

```sql
BEGIN;

INSERT INTO classrooms (...) VALUES (...) RETURNING id;
INSERT INTO lessons (classroom_id, ...) VALUES (1, ...);
INSERT INTO lesson_steps (lesson_id, ...) VALUES (...);

COMMIT;
-- Hoặc ROLLBACK; nếu có lỗi
```

### 5. Tạo Password Đúng Cho User

Password trong database là hash, không thể tạo trực tiếp. Dùng cách sau:

**Cách 1: Qua Django Admin**
1. Tạo superuser: `docker exec webgis_backend python manage.py createsuperuser`
2. Vào http://localhost:8080/admin/
3. Thêm user qua giao diện

**Cách 2: Qua Django Shell**
```bash
docker exec webgis_backend python manage.py shell
```

Trong shell:
```python
from django.contrib.auth.hashers import make_password

# Tạo password hash
password_hash = make_password('password123')
print(password_hash)

# Copy hash này vào SQL INSERT
```

## Tạo Script Nhanh: Thêm Dữ Liệu Mẫu Đầy Đủ

Dưới đây là script SQL hoàn chỉnh để thêm dữ liệu mẫu:

```sql
-- 1. Tạo người dùng mẫu (password: cần tạo qua Django)
-- Chạy trước: docker exec webgis_backend python manage.py createsuperuser

-- 2. Tạo lớp học
INSERT INTO classrooms (name, description, created_at, updated_at, teacher_id)
SELECT 'GIS Cơ Bản 2025', 'Khóa học GIS cơ bản', NOW(), NOW(), id
FROM users WHERE is_staff = TRUE LIMIT 1
RETURNING id;

-- 3. Đăng ký học sinh vào lớp (giả sử classroom_id = 1)
INSERT INTO enrollments (student_id, classroom_id, enrolled_at)
SELECT id, 1, NOW()
FROM users WHERE role = 'student';

-- 4. Tạo bài học
INSERT INTO lessons (title, description, order_index, created_at, updated_at, classroom_id)
VALUES
    ('Bài 1: Giới thiệu GIS', 'Khái niệm cơ bản', 1, NOW(), NOW(), 1),
    ('Bài 2: Hệ tọa độ', 'Tìm hiểu hệ tọa độ', 2, NOW(), NOW(), 1);

-- 5. Tạo các bước học
INSERT INTO lesson_steps (lesson_id, step_type, title, content, order_index)
VALUES
    (1, 'lecture', 'Khái niệm GIS', '<p>GIS là...</p>', 1),
    (1, 'exercise', 'Thực hành', '<p>Hãy thử...</p>', 2);

-- 6. Tạo quiz
INSERT INTO quizzes (title, description, lesson_id, passing_score, time_limit_minutes, created_at)
VALUES ('Quiz Bài 1', 'Kiểm tra kiến thức', 1, 70, 15, NOW());

-- 7. Tạo câu hỏi
INSERT INTO quiz_questions (quiz_id, question_text, question_type, order_index, points)
VALUES (1, 'GIS là gì?', 'multiple_choice', 1, 10);

-- 8. Tạo đáp án
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index)
VALUES
    (1, 'Geographic Information System', TRUE, 1),
    (1, 'Global Information System', FALSE, 2);
```

## Kết Luận

Bây giờ bạn đã biết cách:
✅ Xem cấu trúc bảng
✅ Thêm dữ liệu vào từng bảng
✅ Sử dụng foreign keys và subqueries
✅ Kiểm tra và xem dữ liệu
✅ Sửa và xóa dữ liệu

Chúc bạn thành công!
