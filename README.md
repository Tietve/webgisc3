# WebGIS Educational Platform - Backend

Backend API cho nền tảng WebGIS giáo dục chuyên nghiệp, được xây dựng với Django, GeoDjango và PostgreSQL/PostGIS.

## 🚀 Tính năng chính

- **Quản lý người dùng**: Hệ thống xác thực JWT với vai trò giáo viên/học sinh
- **Lớp học**: Quản lý lớp học, mã tham gia, danh sách học sinh
- **Bài giảng tương tác**: Hệ thống bài giảng với các bước và hành động bản đồ
- **Kiểm tra đánh giá**: Tạo và nộp bài kiểm tra với tự động chấm điểm
- **Dữ liệu GIS**: Quản lý lớp bản đồ và dữ liệu không gian địa lý (GeoJSON)
- **Công cụ phân tích**: Hệ thống công cụ không gian địa lý động (buffer, intersect, etc.)
- **API Documentation**: Tài liệu API tự động với Swagger UI

## 📋 Yêu cầu hệ thống

- Docker & Docker Compose (khuyến nghị)
- HOẶC:
  - Python 3.10+
  - PostgreSQL 14+ với PostGIS 3.x
  - GDAL 3.x

## 🛠️ Cài đặt

### Phương pháp 1: Sử dụng Docker (Khuyến nghị)

1. **Clone repository**
```bash
cd D:\Webgis
```

2. **Tạo file .env**
```bash
cp .env.example .env
```

Chỉnh sửa `.env` nếu cần thiết.

3. **Khởi động services**
```bash
docker-compose up --build
```

4. **Chạy migrations (trong terminal mới)**
```bash
docker-compose exec web python manage.py migrate
```

5. **Tạo dữ liệu mẫu**
```bash
docker-compose exec web python manage.py seed_data
```

6. **Truy cập ứng dụng**
- API: http://localhost:8000/
- Admin: http://localhost:8000/admin/
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/

### Phương pháp 2: Cài đặt thủ công

1. **Cài đặt PostgreSQL/PostGIS**

2. **Tạo database**
```sql
CREATE DATABASE webgis_db;
CREATE USER webgis_user WITH PASSWORD 'webgis_password';
ALTER ROLE webgis_user SET client_encoding TO 'utf8';
ALTER ROLE webgis_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE webgis_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE webgis_db TO webgis_user;

-- Enable PostGIS
\c webgis_db
CREATE EXTENSION postgis;
```

3. **Cài đặt Python dependencies**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Cấu hình environment variables**
```bash
export DJANGO_SETTINGS_MODULE=config.settings.development
export DB_HOST=localhost
# ... other variables from .env.example
```

5. **Chạy migrations**
```bash
python manage.py migrate
```

6. **Tạo dữ liệu mẫu**
```bash
python manage.py seed_data
```

7. **Chạy development server**
```bash
python manage.py runserver
```

## 👤 Tài khoản mẫu

Sau khi chạy `seed_data`, các tài khoản sau sẽ được tạo:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@webgis.com | admin123 | Superuser | Admin panel access |
| teacher@webgis.com | teacher123 | Teacher | Sample teacher |
| student1@webgis.com | student123 | Student | Sample student 1 |
| student2@webgis.com | student123 | Student | Sample student 2 |

## 📚 API Documentation

### Endpoints chính

#### Authentication
- `POST /api/v1/auth/register/` - Đăng ký tài khoản
- `POST /api/v1/auth/token/` - Lấy JWT token
- `POST /api/v1/auth/token/refresh/` - Refresh token
- `GET /api/v1/auth/profile/` - Lấy thông tin user

#### Classrooms
- `GET /api/v1/classrooms/` - Danh sách lớp học
- `POST /api/v1/classrooms/` - Tạo lớp học (teacher)
- `GET /api/v1/classrooms/{id}/` - Chi tiết lớp học
- `GET /api/v1/classrooms/{id}/students/` - Danh sách học sinh
- `POST /api/v1/classrooms/enrollments/join/` - Tham gia lớp (student)

#### Lessons
- `GET /api/v1/lessons/` - Danh sách bài giảng
- `GET /api/v1/lessons/{id}/` - Chi tiết bài giảng với steps và actions

#### Quizzes
- `GET /api/v1/quizzes/` - Danh sách bài kiểm tra
- `GET /api/v1/quizzes/{id}/` - Chi tiết bài kiểm tra
- `GET /api/v1/quizzes/classrooms/{class_id}/quiz_session/{quiz_id}/` - Dữ liệu quiz session
- `POST /api/v1/quizzes/quiz_submissions/` - Nộp bài kiểm tra

#### GIS Data
- `GET /api/v1/layers/` - Danh sách map layers
- `GET /api/v1/layers/{id}/` - Chi tiết layer
- `GET /api/v1/layers/{id}/features/` - GeoJSON features (hỗ trợ bbox filter)

#### Geospatial Tools
- `POST /api/v1/tools/{tool_name}/execute/` - Thực thi công cụ phân tích

**Available tools:**
- `buffer` - Tạo vùng đệm xung quanh geometry
- `intersect` - Tìm giao điểm giữa các geometry

### Xem tài liệu đầy đủ

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/

## 🗄️ Cấu trúc Database

### Core Tables
- `users` - User accounts (UUID, email, role)
- `classrooms` - Classrooms managed by teachers
- `enrollments` - Student-classroom relationships
- `map_layers` - GIS layer metadata
- `vietnam_provinces` - Sample PostGIS table with province geometries

### Lessons
- `lessons` - Interactive lessons
- `lesson_steps` - Steps in each lesson
- `map_actions` - Map actions triggered by steps

### Quizzes
- `quizzes` - Quiz definitions
- `quiz_questions` - Questions in quizzes
- `quiz_answers` - Multiple choice answers
- `quiz_submissions` - Student submissions with scores

## 🧪 Ví dụ API Requests

### Đăng ký và Login

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@webgis.com",
    "password": "student123"
  }'
```

### Lấy GeoJSON Features

```bash
curl -X GET "http://localhost:8000/api/v1/layers/1/features/?bbox=105,10,108,22" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Chạy Buffer Tool

```bash
curl -X POST http://localhost:8000/api/v1/tools/buffer/execute/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input_geojson": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [106.0, 16.0]
      }
    },
    "parameters": {
      "distance": 1000,
      "units": "meters"
    }
  }'
```

## 🔧 Development

### Chạy migrations

```bash
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate
```

### Tạo superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

### Truy cập Django shell

```bash
docker-compose exec web python manage.py shell
```

### Chạy tests (khi có)

```bash
docker-compose exec web python manage.py test
```

## 📁 Cấu trúc Project

```
webgis_backend/
├── config/                      # Django project settings
│   ├── settings/
│   │   ├── base.py             # Base settings
│   │   ├── development.py      # Development settings
│   │   └── production.py       # Production settings
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py
├── apps/
│   ├── core/                   # Core utilities
│   │   ├── exceptions.py       # Custom exception handlers
│   │   ├── pagination.py       # Pagination classes
│   │   └── permissions.py      # Custom permissions
│   ├── users/                  # User authentication
│   ├── classrooms/             # Classroom management
│   ├── lessons/                # Interactive lessons
│   ├── gis_data/               # GIS layers and data
│   ├── quizzes/                # Quiz system
│   └── tools/                  # Geospatial analysis tools
│       └── implementations/    # Tool implementations
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## 🌐 Deployment

### Production Checklist

1. Thay đổi `SECRET_KEY` trong production
2. Set `DEBUG=False`
3. Cập nhật `ALLOWED_HOSTS`
4. Cấu hình HTTPS
5. Setup proper database backups
6. Configure email backend
7. Use production-grade WSGI server (gunicorn/uwsgi)

### Environment Variables for Production

```bash
DEBUG=False
SECRET_KEY=your-very-long-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_HOST=your-db-host
DB_NAME=webgis_prod
DB_USER=webgis_user
DB_PASSWORD=strong-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is for educational purposes.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Developed with ❤️ using Django, GeoDjango, and PostGIS**
