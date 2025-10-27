# 🗺️ WebGIS Educational Platform

Nền tảng giáo dục GIS tương tác với Django + PostGIS + React + Leaflet.

![Platform](https://img.shields.io/badge/Platform-Docker-blue)
![Python](https://img.shields.io/badge/Python-3.10-green)
![Django](https://img.shields.io/badge/Django-4.2-darkgreen)
![React](https://img.shields.io/badge/React-18-61DAFB)
![PostGIS](https://img.shields.io/badge/PostGIS-3.3-blue)

---

## 🎯 Giới Thiệu

WebGIS Educational Platform là nền tảng học tập GIS (Hệ thống Thông tin Địa lý) tương tác, cho phép:

- 📍 Quản lý và hiển thị dữ liệu không gian địa lý (Points, Lines, Polygons)
- 🗺️ Bản đồ tương tác với Leaflet
- 👥 Hệ thống quản lý lớp học (giáo viên/học sinh)
- 📚 Bài giảng GIS tương tác
- ✅ Kiểm tra và đánh giá tự động
- 🛠️ Công cụ phân tích không gian (Buffer, Intersect...)

---

## 🚀 Bắt Đầu Nhanh (3 Bước)

### 📥 Bước 1: Tải Code

```bash
git clone https://github.com/Tietve/webgisc3.git
cd webgisc3
```

### 🐳 Bước 2: Chạy Docker

```bash
docker-compose up -d
```

### 💾 Bước 3: Tạo Database

```bash
docker exec webgis_backend python setup_initial_data.py
```

### 🌐 Bước 4: Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

**Xong! Truy cập:** http://localhost:3000

---

## 🔑 Tài Khoản Demo

| Email | Password | Vai trò |
|-------|----------|---------|
| admin@webgis.com | admin123 | Admin |
| teacher01@webgis.com | teacher123 | Giáo viên |
| student01@webgis.com | student123 | Học sinh |

---

## 📱 Các URL Quan Trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Giao diện bản đồ |
| **Backend API** | http://localhost:8080/api/v1/ | REST API |
| **pgAdmin** | http://localhost:5050 | Quản lý database |
| **Swagger** | http://localhost:8080/api/schema/swagger-ui/ | API docs |

### pgAdmin Login:
- Email: `admin@admin.com`
- Password: `admin`

---

## 📚 Hướng Dẫn Chi Tiết

- **[Hướng Dẫn Cho Người Mới](docs/HUONG_DAN_CHẠY.md)** ⭐ - Bắt đầu từ đầu, chi tiết nhất
- **[Các Loại Geometry GIS](docs/HUONG_DAN_CAC_LOAI_GEOMETRY.md)** - Point, Line, Polygon
- **[Kết Nối pgAdmin](docs/HUONG_DAN_KET_NOI_PGADMIN.md)** - Quản lý database
- **[Thêm Dữ Liệu GIS Nhanh](docs/THEM_DU_LIEU_GIS_NHANH.md)** - SQL examples

---

## 🗺️ Cách Sử Dụng Bản Đồ

1. Đăng nhập vào http://localhost:3000
2. Vào trang **Map Viewer**
3. Click **🗺️ Layers** để bật/tắt các lớp:
   - **Điểm Quan Tâm** - Trường học, bệnh viện, hồ nước...
   - **Ranh Giới** - Ranh giới hành chính
   - **Tuyến Đường** - Tuyến xe bus, metro...

---

## ➕ Thêm Dữ Liệu GIS

### Qua pgAdmin (Khuyến nghị):

1. Mở http://localhost:5050
2. Kết nối đến server `db`:
   - Host: `db`
   - Port: `5432`
   - Database: `webgis_db`
   - User: `webgis_user`
   - Password: `webgis_password`
3. Mở Query Tool và chạy SQL:

**Thêm điểm trường học:**
```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Trường THPT Chu Văn An',
    'Trường học',
    'Trường trung học phổ thông Hà Nội',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')
);
```

**Thêm tuyến bus:**
```sql
INSERT INTO routes (name, type, length_km, geometry)
VALUES (
    'Tuyến Bus 01',
    'Bus',
    12.5,
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8234,21.0589],
            [105.8456,21.0334],
            [105.8527,21.0285]
        ]
    }')
);
```

Xem thêm ví dụ trong file **`test_all_geometry_types.sql`**

---

## 🏗️ Kiến Trúc

```
┌─────────────────┐
│   Frontend      │  React + Vite + Leaflet
│  localhost:3000 │  Hiển thị bản đồ tương tác
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│   Backend API   │  Django + GeoDjango
│  localhost:8080 │  REST API endpoints
└────────┬────────┘
         │ SQL
┌────────▼────────┐
│   PostgreSQL    │  PostgreSQL 14 + PostGIS 3.3
│    + PostGIS    │  Lưu trữ dữ liệu GIS
└─────────────────┘
```

---

## 📊 Database Tables

| Table | Loại Geometry | Dùng Cho |
|-------|---------------|----------|
| `points_of_interest` | POINT | Điểm (trường, bệnh viện, hồ...) |
| `routes` | LINESTRING | Đường nối (bus, metro...) |
| `boundaries` | MULTIPOLYGON | Ranh giới (tỉnh, quận...) |
| `vietnam_provinces` | MULTIPOLYGON | Ranh giới tỉnh thành VN |

---

## 🛑 Dừng và Khởi Động Lại

### Dừng containers:
```bash
docker-compose stop
```

### Khởi động lại:
```bash
docker-compose up -d
cd frontend && npm run dev
```

### Xóa tất cả (cẩn thận - mất dữ liệu!):
```bash
docker-compose down -v
```

---

## 🔧 Yêu Cầu Hệ Thống

- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Node.js 18+** (cho frontend)
- **5GB dung lượng trống**
- **8GB RAM** (khuyến nghị)

---

## 📦 Công Nghệ Sử Dụng

### Backend:
- **Django 4.2** - Python web framework
- **GeoDjango** - GIS extension cho Django
- **Django REST Framework** - REST API
- **PostGIS 3.3** - Spatial database extension
- **JWT Authentication** - Token-based auth

### Frontend:
- **React 18** - UI framework
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings
- **Axios** - HTTP client

### Infrastructure:
- **Docker** - Containerization
- **PostgreSQL 14** - Database
- **pgAdmin 4** - Database management

---

## 🧪 API Endpoints Chính

### Authentication:
- `POST /api/v1/auth/token/` - Login
- `GET /api/v1/auth/profile/` - User profile

### GIS Data:
- `GET /api/v1/layers/` - Danh sách layers
- `GET /api/v1/layers/1/features/` - Points (trường, hồ...)
- `GET /api/v1/layers/2/features/` - Boundaries (ranh giới)
- `GET /api/v1/layers/3/features/` - Routes (tuyến đường)

### Classrooms:
- `GET /api/v1/classrooms/` - Danh sách lớp
- `POST /api/v1/classrooms/` - Tạo lớp (teacher)
- `POST /api/v1/classrooms/enrollments/join/` - Tham gia lớp

Xem đầy đủ: http://localhost:8080/api/schema/swagger-ui/

---

## ❓ Khắc Phục Lỗi

### Docker không chạy?
```bash
# Kiểm tra Docker đang chạy
docker --version

# Khởi động Docker Desktop (Windows/Mac)
# Hoặc: sudo systemctl start docker (Linux)
```

### Port bị chiếm?
```bash
# Kiểm tra port 5432 (PostgreSQL)
netstat -ano | findstr :5432

# Dừng PostgreSQL local nếu có
net stop postgresql
```

### Backend không kết nối được?
```bash
# Xem logs
docker logs webgis_backend

# Khởi động lại
docker restart webgis_backend
```

### Frontend không hiển thị dữ liệu?
1. Kiểm tra đã chạy `setup_initial_data.py` chưa
2. Kiểm tra API hoạt động: http://localhost:8080/api/v1/layers/
3. Bật DevTools (F12) xem lỗi Console
4. Refresh trang (Ctrl+F5)

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

---

## 📄 License

Educational purposes only.

---

## 📧 Liên Hệ

- **GitHub Issues**: https://github.com/Tietve/webgisc3/issues
- **Repository**: https://github.com/Tietve/webgisc3

---

## ⭐ Screenshots

### Bản Đồ Tương Tác
![Map Viewer](https://via.placeholder.com/800x400?text=Map+Viewer+with+Layers)

### Quản Lý Lớp Học
![Classrooms](https://via.placeholder.com/800x400?text=Classroom+Management)

### Công Cụ GIS
![Tools](https://via.placeholder.com/800x400?text=GIS+Analysis+Tools)

---

**Phát triển với ❤️ bằng Django, GeoDjango, PostGIS, React & Leaflet**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
