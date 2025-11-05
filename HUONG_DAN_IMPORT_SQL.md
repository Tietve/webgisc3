# 📦 Hướng Dẫn Import Dữ Liệu Qua pgAdmin

## 🎯 Cách Nhanh Nhất - 3 Bước

### Bước 1: Mở pgAdmin và kết nối database

1. Truy cập: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@webgis.com`
   - Password: `admin123`

3. Kết nối database (nếu chưa):
   - Click chuột phải **Servers** → **Create** → **Server**
   - Tab **General**: Name = `WebGIS DB`
   - Tab **Connection**:
     - Host: `db`
     - Port: `5432`
     - Database: `webgis_db`
     - Username: `webgis_user`
     - Password: `webgis_password`
   - **Save**

### Bước 2: Import file SQL

1. Click chuột phải vào **webgis_db** → **Query Tool**
2. Mở file `sample_data_full.sql` bằng Notepad
3. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
4. **Paste vào Query Tool** trong pgAdmin (Ctrl+V)
5. Click **Execute** (hoặc nhấn F5)
6. Đợi 5-10 giây → xem kết quả ở tab **Messages**

### Bước 3: Set password cho users

Vì password trong SQL không thể hash trước, cần chạy lệnh sau:

```bash
docker exec webgis_backend python set_passwords.py
```

**Hoặc** nếu muốn làm thủ công:

```bash
docker exec -it webgis_backend python manage.py shell
```

Trong shell Python:

```python
from apps.users.models import User

# Set password cho từng user
User.objects.get(email='admin@webgis.com').set_password('admin123')
User.objects.get(email='admin@webgis.com').save()

User.objects.get(email='teacher@webgis.com').set_password('teacher123')
User.objects.get(email='teacher@webgis.com').save()

User.objects.get(email='student1@webgis.com').set_password('student123')
User.objects.get(email='student1@webgis.com').save()

User.objects.get(email='student2@webgis.com').set_password('student123')
User.objects.get(email='student2@webgis.com').save()

exit()
```

---

## ✅ Kiểm Tra Dữ Liệu Đã Import

### Trong pgAdmin (Query Tool):

```sql
-- Kiểm tra số lượng records
SELECT
    (SELECT COUNT(*) FROM users_user) as users,
    (SELECT COUNT(*) FROM classrooms_classroom) as classrooms,
    (SELECT COUNT(*) FROM gis_data_vietnamprovince) as provinces,
    (SELECT COUNT(*) FROM lessons_lesson) as lessons,
    (SELECT COUNT(*) FROM quizzes_quiz) as quizzes,
    (SELECT COUNT(*) FROM points_of_interest) as poi;

-- Xem danh sách users
SELECT id, email, role, is_staff, is_superuser FROM users_user;

-- Xem provinces với geometry
SELECT name, code, region, population, ST_AsText(geometry) as geom
FROM gis_data_vietnamprovince;

-- Xem points of interest
SELECT name, category, ST_AsText(geometry) as location
FROM points_of_interest;
```

### Qua Django Admin:

1. Truy cập: **http://localhost:8080/admin/**
2. Đăng nhập: `admin@webgis.com` / `admin123`
3. Kiểm tra các bảng: Users, Classrooms, Lessons, Provinces...

### Qua API:

```bash
# Get JWT token
curl -X POST http://localhost:8080/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@webgis.com","password":"student123"}'

# Kiểm tra layers
curl http://localhost:8080/api/v1/layers/

# Kiểm tra provinces (GeoJSON)
curl http://localhost:8080/api/v1/layers/1/features/
```

---

## 📊 Dữ Liệu Đã Import

### Users (4 users):
| Email | Password | Role |
|-------|----------|------|
| admin@webgis.com | admin123 | Admin (Superuser) |
| teacher@webgis.com | teacher123 | Teacher |
| student1@webgis.com | student123 | Student |
| student2@webgis.com | student123 | Student |

### Classrooms (1 classroom):
- **Địa lý Việt Nam 11**
- Enrollment code: `GIS2024`
- Teacher: teacher@webgis.com
- Students: 2 students enrolled

### Lessons (1 lesson):
- **Khám phá bản đồ Việt Nam**
- 3 interactive steps với map actions

### Vietnam Provinces (5 provinces):
- Hà Nội (North) - 8M dân
- TP. Hồ Chí Minh (South) - 9M dân
- Đà Nẵng (Central) - 1.1M dân
- Hải Phòng (North) - 2M dân
- Cần Thơ (South) - 1.3M dân

### Quizzes (1 quiz):
- **Kiểm tra kiến thức Địa lý Việt Nam**
- 3 questions với multiple choice answers

### Points of Interest (5 points):
- Hồ Hoàn Kiếm (Hà Nội)
- Chợ Bến Thành (TP.HCM)
- Phố cổ Hội An
- Cầu Rồng (Đà Nẵng)
- Nhà thờ Đức Bà (TP.HCM)

### Routes (2 routes):
- Tuyến Bus 01 - Hà Nội
- Tuyến Metro số 1 - TP.HCM

---

## 🔄 Reset Dữ Liệu (nếu cần)

Nếu muốn xóa tất cả và import lại:

### Cách 1: Xóa từng bảng (trong pgAdmin):

```sql
TRUNCATE TABLE users_user CASCADE;
TRUNCATE TABLE classrooms_classroom CASCADE;
TRUNCATE TABLE gis_data_vietnamprovince CASCADE;
TRUNCATE TABLE lessons_lesson CASCADE;
TRUNCATE TABLE quizzes_quiz CASCADE;
TRUNCATE TABLE points_of_interest CASCADE;
TRUNCATE TABLE routes CASCADE;
```

Sau đó import lại file `sample_data_full.sql`.

### Cách 2: Reset toàn bộ database:

```bash
# XÓA TOÀN BỘ - CẨNTHẬN!
docker-compose down -v
docker-compose up -d

# Chờ containers start xong, rồi:
docker exec webgis_backend python manage.py migrate

# Import SQL lại qua pgAdmin
# Sau đó set passwords
docker exec webgis_backend python set_passwords.py
```

---

## ❓ Xử Lý Lỗi

### Lỗi: "relation does not exist"

➡️ **Nguyên nhân:** Chưa chạy migrations

**Giải pháp:**
```bash
docker exec webgis_backend python manage.py migrate
```

Sau đó import lại file SQL.

### Lỗi: "duplicate key value violates unique constraint"

➡️ **Nguyên nhân:** Dữ liệu đã tồn tại

**Giải pháp:**
```sql
-- Xóa dữ liệu cũ trước (trong pgAdmin):
TRUNCATE TABLE users_user CASCADE;
TRUNCATE TABLE classrooms_classroom CASCADE;
```

Sau đó import lại.

### Lỗi khi đăng nhập: "Invalid credentials"

➡️ **Nguyên nhân:** Chưa set password

**Giải pháp:**
```bash
docker exec webgis_backend python set_passwords.py
```

---

## 💡 Tóm Tắt Nhanh

```bash
# 1. Mở pgAdmin → Import file sample_data_full.sql

# 2. Set passwords
docker exec webgis_backend python set_passwords.py

# 3. Đăng nhập và sử dụng!
# - Django Admin: http://localhost:8080/admin/
# - Frontend: http://localhost:3000
```

---

## 🎉 Xong! Giờ Có Thể Sử Dụng

- ✅ 4 users đã có sẵn
- ✅ 1 classroom với 2 students
- ✅ 1 interactive lesson
- ✅ 5 provinces với geometry
- ✅ 1 quiz với 3 questions
- ✅ 5 points of interest
- ✅ 2 routes (bus, metro)

**Chúc bạn thành công! 🚀**
