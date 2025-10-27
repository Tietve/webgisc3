# HƯỚNG DẪN TẠO DATABASE THỦ CÔNG

Do Docker Desktop gặp lỗi API, chúng ta sẽ tạo database thủ công bằng PostgreSQL local + pgAdmin.

## BƯỚC 1: Mở pgAdmin

1. Mở ứng dụng **pgAdmin** trên máy tính của bạn
2. Kết nối đến PostgreSQL server local (thường là localhost hoặc PostgreSQL XX)

## BƯỚC 2: Tạo Database

1. Trong pgAdmin, chuột phải vào **Databases** → **Create** → **Database**
2. Điền thông tin:
   - **Database name**: `webgis_db`
   - **Owner**: Chọn user hiện tại (thường là `postgres`)
   - Click **Save**

## BƯỚC 3: Enable PostGIS Extension (TÙY CHỌN)

**LƯU Ý**: Bước này chỉ cần nếu bạn muốn dùng GIS features. Nếu không, bỏ qua bước này.

1. Trong pgAdmin, mở database `webgis_db` vừa tạo
2. Chuột phải vào `webgis_db` → **Query Tool**
3. Chạy lệnh SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Click nút **Execute** (icon tam giác)

Nếu gặp lỗi "extension postgis not found", có nghĩa PostGIS chưa được cài đặt trên PostgreSQL local. Bạn có thể:
- Bỏ qua và sử dụng script `add_data_simple.py` (không có GIS data)
- Hoặc cài đặt PostGIS extension cho PostgreSQL

## BƯỚC 4: Cập Nhật File .env

Mở file `.env` và kiểm tra/cập nhật thông tin kết nối database:

```
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# Database settings - điều chỉnh cho phù hợp với PostgreSQL local của bạn
DB_HOST=localhost
DB_NAME=webgis_db
DB_USER=postgres
DB_PASSWORD=<mật khẩu PostgreSQL của bạn>
DB_PORT=5432

DJANGO_SETTINGS_MODULE=config.settings.development
```

**QUAN TRỌNG**: Thay `<mật khẩu PostgreSQL của bạn>` bằng mật khẩu thực tế của PostgreSQL.

## BƯỚC 5: Chạy Migrations

Mở terminal tại thư mục dự án và chạy:

```bash
python manage.py migrate
```

Lệnh này sẽ tạo tất cả các bảng cần thiết trong database.

## BƯỚC 6: Thêm Dữ Liệu Mẫu

### Tùy chọn A: Không có GIS data (khuyến nghị nếu không có PostGIS)

```bash
python add_data_simple.py
```

### Tùy chọn B: Có GIS data (cần PostGIS + GDAL)

```bash
python add_data.py
```

## BƯỚC 7: Kiểm Tra Database trong pgAdmin

1. Trong pgAdmin, refresh database `webgis_db`
2. Mở **Schemas** → **public** → **Tables**
3. Bạn sẽ thấy các bảng sau:
   - `users_user`
   - `classrooms_classroom`
   - `classrooms_enrollment`
   - `lessons_lesson`
   - `lessons_lessonstep`
   - `lessons_mapaction`
   - `quizzes_quiz`
   - `quizzes_quizquestion`
   - `quizzes_quizanswer`
   - Và nhiều bảng khác...

4. Chuột phải vào bảng `users_user` → **View/Edit Data** → **All Rows** để xem dữ liệu

## THÔNG TIN ĐĂNG NHẬP

Sau khi chạy script thêm dữ liệu, bạn có thể đăng nhập với:

### Django Admin Panel
- URL: http://localhost:8000/admin/
- Email: `admin@webgis.com`
- Password: `admin123`

### Tài khoản khác
- Teacher: `teacher@webgis.com` / `teacher123`
- Student: `student1@webgis.com` / `student123`

## XỬ LÝ SỰ CỐ

### Lỗi: "Could not translate host name to address"
→ Kiểm tra `DB_HOST` trong file `.env`, thử đổi thành `127.0.0.1`

### Lỗi: "password authentication failed"
→ Kiểm tra `DB_PASSWORD` trong file `.env`

### Lỗi: "database webgis_db does not exist"
→ Quay lại Bước 2 và tạo database

### Lỗi: "django.db.backends.postgresql_psycopg2 isn't an available database backend"
→ Cài đặt: `pip install psycopg2-binary`

### Lỗi: "GDAL library not found"
→ Sử dụng `add_data_simple.py` thay vì `add_data.py`
