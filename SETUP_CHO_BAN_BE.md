# 🚀 Hướng Dẫn Setup WebGIS - Đơn Giản Nhất

## 📝 Giải Thích Ngắn Gọn

### ❓ Tại sao phải chạy nhiều lệnh?

**1. `docker-compose up -d`**
- ➡️ Chỉ START containers (PostgreSQL + Django)
- ❌ CHƯA TẠO BẢNG trong database

**2. `docker exec webgis_backend python manage.py migrate`**
- ➡️ Django TẠO CÁC BẢNG (users_user, classrooms, lessons...)
- ✅ Giờ database có bảng rồi, nhưng TRỐNG

**3. `docker exec webgis_backend python manage.py seed_data`**
- ➡️ Tạo USERS + CLASSROOMS + LESSONS
- ✅ Password tự động HASH ĐÚNG (không cần set thủ công!)

**4. Import SQL vào pgAdmin**
- ➡️ Thêm DỮ LIỆU GIS (provinces, points, routes)
- ✅ Xong! Có đầy đủ dữ liệu

---

### ❓ Tại sao không lưu password trong SQL?

**Django KHÔNG LƯU password dạng text thường!**

❌ **KHÔNG THỂ:**
```sql
INSERT INTO users (email, password)
VALUES ('admin@webgis.com', 'admin123');  -- Sai!
```

✅ **PHẢI HASH:**
```
Password: admin123
    ↓ (Django hash bằng PBKDF2)
Hash: pbkdf2_sha256$600000$randomsalt$j8h4k2g9f...
```

**Vấn đề:** Hash phụ thuộc vào SECRET_KEY của TỪNG MÁY!
- Máy của bạn: SECRET_KEY = "xyz..."
- Máy của bạn bè: SECRET_KEY = "abc..." (KHÁC!)

➡️ **Giải pháp:** Dùng `seed_data` command - tự động hash đúng!

---

## ✅ Các Bước Setup (4 bước duy nhất)

### Bước 1: Clone code

```bash
git clone <repo-url>
cd webgis
```

### Bước 2: Start Docker + Tạo bảng

```bash
# Start containers
docker-compose up -d

# Đợi 10 giây cho containers khởi động...

# Tạo các bảng trong database
docker exec webgis_backend python manage.py migrate
```

**Giải thích:**
- `docker-compose up -d`: Start PostgreSQL + Django containers
- `migrate`: Tạo tất cả bảng (users, classrooms, lessons, provinces...)

### Bước 3: Tạo users + classrooms + lessons

```bash
docker exec webgis_backend python manage.py seed_data
```

**Kết quả:**
- ✅ 4 users (admin, teacher, 2 students) - password đã hash đúng!
- ✅ 1 classroom với 2 students enrolled
- ✅ 1 interactive lesson (3 steps)
- ✅ 5 provinces (Hà Nội, HCM, Đà Nẵng...)
- ✅ 1 quiz với 3 câu hỏi

### Bước 4: Thêm dữ liệu GIS (qua pgAdmin)

**4.1. Mở pgAdmin:**
- URL: http://localhost:5050
- Email: `admin@webgis.com`
- Password: `admin123`

**4.2. Kết nối database (lần đầu):**
- Click chuột phải **Servers** → **Create** → **Server**
- Tab **General**: Name = `WebGIS DB`
- Tab **Connection**:
  - Host: `db`
  - Port: `5432`
  - Database: `webgis_db`
  - Username: `webgis_user`
  - Password: `webgis_password`
- Click **Save**

**4.3. Import SQL:**
1. Click chuột phải **webgis_db** → **Query Tool**
2. Mở file **`sample_data_gis_only.sql`** bằng Notepad
3. Copy toàn bộ (Ctrl+A, Ctrl+C)
4. Paste vào Query Tool (Ctrl+V)
5. Click **Execute** (F5)

**Kết quả:**
- ✅ 15 provinces (thêm 10 tỉnh nữa)
- ✅ 18 points of interest (Hồ Hoàn Kiếm, Chợ Bến Thành...)
- ✅ 6 routes (bus, metro, highway)
- ✅ 3 boundaries (quận/huyện)

---

## 🔑 Tài Khoản Sau Khi Setup

| Email | Password | Vai trò |
|-------|----------|---------|
| admin@webgis.com | admin123 | Admin (Superuser) |
| teacher@webgis.com | teacher123 | Teacher |
| student1@webgis.com | student123 | Student |
| student2@webgis.com | student123 | Student |

**Đăng nhập tại:**
- Django Admin: http://localhost:8080/admin/
- Frontend: http://localhost:3000 (sau khi chạy `npm run dev`)

---

## 🌐 Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập: http://localhost:3000

---

## ✅ Kiểm Tra Dữ Liệu

### Qua Django Admin:
1. Mở: http://localhost:8080/admin/
2. Đăng nhập: `admin@webgis.com` / `admin123`
3. Kiểm tra: Users (4), Classrooms (1), Provinces (15)

### Qua pgAdmin:
```sql
-- Kiểm tra users
SELECT email, role, is_staff FROM users_user;

-- Kiểm tra provinces
SELECT name, region, population FROM gis_data_vietnamprovince;

-- Kiểm tra points
SELECT name, category, ST_AsText(geometry) FROM points_of_interest;
```

### Qua API:
```bash
# Get token
curl -X POST http://localhost:8080/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@webgis.com","password":"admin123"}'

# Get provinces (GeoJSON)
curl http://localhost:8080/api/v1/layers/1/features/
```

---

## 📊 Tóm Tắt Dữ Liệu Có Sẵn

Sau khi setup xong, bạn có:

### Users & Classrooms:
- ✅ 4 users (admin, teacher, 2 students)
- ✅ 1 classroom: "Địa lý Việt Nam 11"
- ✅ 2 students enrolled

### Lessons & Quizzes:
- ✅ 1 lesson: "Khám phá bản đồ Việt Nam" (3 steps)
- ✅ 1 quiz: "Kiểm tra kiến thức" (3 questions)

### GIS Data:
- ✅ 15 Vietnam provinces (Hà Nội, HCM, Đà Nẵng, Quảng Ninh...)
- ✅ 18 points of interest (Hồ Hoàn Kiếm, Chợ Bến Thành, Cầu Rồng...)
- ✅ 6 routes (tuyến bus, metro, quốc lộ)
- ✅ 3 boundaries (quận Ba Đình, Hoàn Kiếm, Quận 1)

---

## ❓ Xử Lý Lỗi

### Lỗi: "No such container: webgis_backend"

➡️ Container chưa chạy:
```bash
docker ps  # Xem containers đang chạy
docker-compose up -d  # Start lại
```

### Lỗi: "relation does not exist"

➡️ Chưa chạy migrations:
```bash
docker exec webgis_backend python manage.py migrate
```

### Lỗi: "Invalid credentials" khi đăng nhập

➡️ Chưa chạy seed_data:
```bash
docker exec webgis_backend python manage.py seed_data
```

### Port 5432 bị chiếm (PostgreSQL local)

➡️ Dừng PostgreSQL local:
```bash
# Windows
net stop postgresql-x64-14

# Hoặc sửa docker-compose.yml
ports:
  - "5433:5432"  # Đổi port
```

---

## 🔄 Reset Lại Từ Đầu

Nếu muốn xóa tất cả và làm lại:

```bash
# Xóa containers + volumes (XÓA TẤT CẢ DỮ LIỆU!)
docker-compose down -v

# Setup lại từ đầu
docker-compose up -d
docker exec webgis_backend python manage.py migrate
docker exec webgis_backend python manage.py seed_data

# Import SQL lại (qua pgAdmin)
```

---

## 💡 Tóm Tắt Cực Ngắn

```bash
# 1. Start
docker-compose up -d

# 2. Tạo bảng
docker exec webgis_backend python manage.py migrate

# 3. Tạo users & data
docker exec webgis_backend python manage.py seed_data

# 4. Import GIS data
# → Mở pgAdmin → Import file sample_data_gis_only.sql

# 5. Chạy frontend
cd frontend && npm install && npm run dev

# 6. Done! http://localhost:3000
```

---

## 📚 Files Quan Trọng

- **`sample_data_gis_only.sql`** ← Import file này vào pgAdmin
- **`docker-compose.yml`** ← Cấu hình Docker
- **`README.md`** ← Tài liệu chính

---

**Chúc bạn setup thành công! 🎉**

Nếu gặp lỗi, đọc phần "Xử Lý Lỗi" ở trên hoặc liên hệ người tạo repo.
