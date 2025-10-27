# Bắt Đầu Nhanh - WebGIS

## ✅ Docker Đã Chạy Thành Công!

Các dịch vụ đang chạy:
- 🗄️ **PostgreSQL + PostGIS**: localhost:5433
- 🖥️ **pgAdmin**: http://localhost:5050
- 🐍 **Django Backend**: http://localhost:8080

## Bước 1: Tạo Superuser (Admin)

Để quản lý hệ thống qua Django Admin, tạo tài khoản admin:

```bash
docker exec -it webgis_backend python manage.py createsuperuser
```

Nhập thông tin:
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123` (hoặc password bạn muốn)

## Bước 2: Truy Cập Django Admin

1. Mở: **http://localhost:8080/admin/**
2. Đăng nhập bằng tài khoản vừa tạo
3. Từ đây bạn có thể:
   - Thêm/sửa/xóa Users
   - Tạo Classrooms (Lớp học)
   - Tạo Lessons (Bài học)
   - Tạo Quizzes (Bài kiểm tra)

## Bước 3: Truy Cập pgAdmin (Thêm Dữ Liệu GIS)

### Đăng nhập pgAdmin

1. Mở: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@webgis.com`
   - Password: `admin123`

### Kết nối Database

1. Click chuột phải **Servers** → **Create** → **Server**
2. Tab **General**: Name = `WebGIS Database`
3. Tab **Connection**:
   ```
   Host: db
   Port: 5432
   Database: webgis_db
   Username: webgis_user
   Password: webgis_password
   ✓ Save password
   ```
4. Click **Save**

### Thêm Dữ Liệu GeoJSON

1. Click chuột phải vào **webgis_db** → **Query Tool**
2. Copy và chạy script SQL để thêm layer GIS:

```sql
-- Bật PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tạo bảng lưu điểm quan tâm
CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    geometry GEOMETRY(Point, 4326)
);

-- Thêm dữ liệu mẫu
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Hồ Hoàn Kiếm', 'Hồ nước', 'Hồ nước nổi tiếng ở Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0285]}')),

    ('Chợ Bến Thành', 'Chợ', 'Chợ lớn nhất TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981, 10.7720]}')),

    ('Phố cổ Hội An', 'Di tích', 'Khu phố cổ nổi tiếng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.3277, 15.8801]}'));

-- Kiểm tra dữ liệu
SELECT id, name, category, ST_AsText(geometry) as location
FROM points_of_interest;
```

## Bước 4: Thêm Dữ Liệu Qua pgAdmin

### Cách 1: Dùng SQL (Khuyên dùng)

Xem file hướng dẫn chi tiết:
- **HUONG_DAN_THEM_DU_LIEU_VAO_BANG.md** - Thêm user, classroom, lesson, quiz
- **HUONG_DAN_THEM_DU_LIEU_THU_CONG.md** - Thêm dữ liệu GIS (Point, Line, Polygon)

### Cách 2: Dùng Django Admin (Dễ hơn)

1. Truy cập: http://localhost:8080/admin/
2. Click vào bảng muốn thêm (Users, Classrooms, Lessons...)
3. Click **Add** → Điền thông tin → **Save**

## Bước 5: Kiểm Tra API

```bash
# Kiểm tra API hoạt động
curl http://localhost:8080/api/

# Xem danh sách users
curl http://localhost:8080/api/users/

# Xem API documentation
open http://localhost:8080/api/schema/swagger-ui/
```

## Các Lệnh Docker Hữu Ích

```bash
# Xem containers đang chạy
docker ps

# Xem logs
docker logs webgis_backend
docker logs webgis_postgis
docker logs webgis_pgadmin

# Dừng containers
docker-compose down

# Khởi động lại
docker-compose up -d

# Rebuild (sau khi sửa code)
docker-compose up -d --build

# Vào PostgreSQL trực tiếp
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# Vào Django shell
docker exec -it webgis_backend python manage.py shell

# Chạy migrations
docker exec webgis_backend python manage.py migrate

# Tạo superuser
docker exec -it webgis_backend python manage.py createsuperuser
```

## Thêm Dữ Liệu Mẫu Nhanh

### Tạo User, Classroom, Lesson Qua Django Shell

```bash
# Vào Django shell
docker exec -it webgis_backend python manage.py shell
```

Trong shell Python:

```python
from apps.users.models import User
from apps.classrooms.models import Classroom
from apps.lessons.models import Lesson

# Tạo giáo viên
teacher = User.objects.create_user(
    username='teacher01',
    email='teacher@example.com',
    password='teacher123',
    first_name='Nguyen',
    last_name='Van A',
    role='teacher',
    is_staff=True
)

# Tạo học sinh
student = User.objects.create_user(
    username='student01',
    email='student@example.com',
    password='student123',
    first_name='Tran',
    last_name='Thi B',
    role='student'
)

# Tạo lớp học
classroom = Classroom.objects.create(
    name='GIS Cơ Bản 101',
    description='Khóa học GIS cho người mới bắt đầu',
    teacher=teacher
)

# Đăng ký học sinh vào lớp
classroom.students.add(student)

# Tạo bài học
lesson = Lesson.objects.create(
    title='Bài 1: Giới thiệu GIS',
    description='Tìm hiểu về GIS',
    classroom=classroom,
    order_index=1
)

print("✅ Đã tạo dữ liệu mẫu thành công!")
```

## Lấy Tọa Độ GeoJSON Từ Đâu?

### Cách 1: geojson.io (Khuyên dùng)

1. Truy cập: **https://geojson.io/**
2. Click vào bản đồ để vẽ:
   - 📍 Point: Click nút marker
   - 📏 Line: Click nút draw line
   - 📐 Polygon: Click nút draw polygon
3. Bên phải sẽ hiện code GeoJSON
4. Copy và paste vào SQL

### Cách 2: Google Maps

1. Click chuột phải trên Google Maps
2. Click vào tọa độ để copy (VD: `21.028511, 105.804817`)
3. Format lại: `[105.804817, 21.028511]` (đảo ngược: kinh độ trước, vĩ độ sau)
4. Tạo GeoJSON:
   ```json
   {"type":"Point","coordinates":[105.804817, 21.028511]}
   ```

## Xử Lý Sự Cố

### Container không start

```bash
docker logs webgis_backend
docker logs webgis_postgis
```

### Reset database (XÓA TOÀN BỘ DỮ LIỆU!)

```bash
docker-compose down -v
docker-compose up -d
```

### Port bị chiếm

Sửa trong `docker-compose.yml`:
```yaml
ports:
  - "PORT_MỚI:PORT_CONTAINER"
```

## Tài Liệu Chi Tiết

- `DOCKER_GUIDE.md` - Hướng dẫn Docker
- `HUONG_DAN_THEM_LAYER.md` - Hướng dẫn thêm GIS layers
- `HUONG_DAN_THEM_DU_LIEU_THU_CONG.md` - Thêm dữ liệu GIS thủ công
- `HUONG_DAN_THEM_DU_LIEU_VAO_BANG.md` - Thêm dữ liệu vào bảng có sẵn

## Tóm Tắt

✅ Docker đang chạy
✅ Database đã có sẵn các bảng
✅ Có thể thêm dữ liệu qua:
   - Django Admin (dễ nhất)
   - pgAdmin + SQL
   - Django Shell (script)

**Bước tiếp theo:**
1. Tạo superuser: `docker exec -it webgis_backend python manage.py createsuperuser`
2. Vào Django Admin: http://localhost:8080/admin/
3. Thêm dữ liệu!

Chúc bạn thành công! 🎉
