# 🔄 Hướng Dẫn Tiếp Tục Sau Khi Restart Máy

## ⚠️ Tình Trạng Hiện Tại

**Đã hoàn thành:**
- ✅ Cấu hình PostGIS trong `docker-compose.yml`
- ✅ Cấu hình CORS trong `config/settings/development.py`
- ✅ Tạo sample data: `sample_data/vietnam_provinces.geojson` (10 tỉnh)
- ✅ Tạo import command: `apps/gis_data/management/commands/import_provinces.py`
- ✅ Tạo demo users script: `create_demo_users.py`
- ✅ Tạo setup script: `setup_postgis.sh`
- ✅ Docker images đã build xong

**Vấn đề:**
- ❌ Docker bị chậm/hang, commands không respond
- ❌ Port conflict giữa 2 docker-compose files
- ❌ Cần restart Docker/máy

---

## 🚀 Các Bước Sau Khi Restart Máy

### Bước 1: Khởi động Docker Desktop

```bash
# Mở Docker Desktop và đợi nó start hoàn toàn
# Kiểm tra Docker đã sẵn sàng:
docker --version
docker ps
```

### Bước 2: Dọn dẹp containers cũ

```bash
# Chuyển vào thư mục project
cd D:\Webgis

# Dừng tất cả containers cũ
docker stop $(docker ps -q)

# Xóa containers cũ (nếu cần)
docker-compose down
docker-compose -f docker-compose-simple.yml down

# Kiểm tra không còn containers nào chạy
docker ps
```

### Bước 3: Start PostGIS Containers

```bash
# Start containers với PostGIS
docker-compose up -d

# Đợi 10-15 giây để PostgreSQL khởi động
# Kiểm tra containers đang chạy:
docker ps
```

Bạn sẽ thấy 2 containers:
- `webgis_backend` - Django với GeoDjango
- `webgis_postgis` - PostgreSQL + PostGIS

### Bước 4: Chạy Setup Script

**Option A: Chạy toàn bộ setup script (Khuyên dùng)**

```bash
docker exec -it webgis_backend bash setup_postgis.sh
```

Script này sẽ tự động:
1. Run migrations
2. Create demo users
3. Import 10 tỉnh vào database

**Option B: Chạy từng lệnh**

```bash
# 1. Run migrations
docker exec -it webgis_backend python manage.py makemigrations
docker exec -it webgis_backend python manage.py migrate

# 2. Create demo users
docker exec -it webgis_backend python create_demo_users.py

# 3. Import provinces
docker exec -it webgis_backend python manage.py import_provinces
```

### Bước 5: Kiểm tra API

```bash
# Test layers API
curl http://localhost:8080/api/v1/layers/

# Test login
curl -X POST http://localhost:8080/api/v1/auth/token/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teacher@example.com\",\"password\":\"teacher123\"}"
```

### Bước 6: Start Frontend

```bash
cd D:\Webgis\frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3001

---

## 🌐 Truy Cập Ứng Dụng

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | teacher@example.com / teacher123 |
| **Backend API** | http://localhost:8080 | - |
| **Django Admin** | http://localhost:8080/admin | admin@example.com / admin123 |
| **API Docs** | http://localhost:8080/api/schema/swagger-ui/ | - |

---

## 🧪 Test GIS Features

### 1. Test qua Django Admin

```bash
# 1. Vào http://localhost:8080/admin
# 2. Login: admin@example.com / admin123
# 3. Navigate: GIS Data → Map Layers
# 4. Bạn sẽ thấy layer "Tỉnh Thành Việt Nam"
# 5. Navigate: GIS Data → Vietnam Provinces
# 6. Xem 10 tỉnh đã import
```

### 2. Test qua API

```bash
# Get access token
curl -s -X POST http://localhost:8080/api/v1/auth/token/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teacher@example.com\",\"password\":\"teacher123\"}"

# Lưu token vào biến (PowerShell):
$TOKEN = (curl -s -X POST http://localhost:8080/api/v1/auth/token/ -H "Content-Type: application/json" -d "{\"email\":\"teacher@example.com\",\"password\":\"teacher123\"}") | ConvertFrom-Json | Select-Object -ExpandProperty access

# List layers
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/layers/

# Get layer features (GeoJSON)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/layers/1/features/
```

### 3. Test qua Frontend

```bash
# 1. Vào http://localhost:3001
# 2. Login: teacher@example.com / teacher123
# 3. Click vào Map Viewer
# 4. Click nút Layers (góc trên bên trái)
# 5. Tick chọn "Tỉnh Thành Việt Nam"
# 6. Bản đồ sẽ hiển thị 10 tỉnh
```

---

## 🗂️ Files Quan Trọng

### Cấu hình Docker
- `docker-compose.yml` - PostGIS setup (port 8080)
- `docker-compose-simple.yml` - SQLite setup (port 8000) - KHÔNG DÙNG

### Scripts
- `setup_postgis.sh` - Complete setup automation
- `create_demo_users.py` - Create admin, teacher, student accounts

### Sample Data
- `sample_data/vietnam_provinces.geojson` - 10 tỉnh Việt Nam

### Import Commands
- `apps/gis_data/management/commands/import_provinces.py` - Import GeoJSON vào PostGIS

### Documentation
- `README_POSTGIS_SETUP.md` - Full setup guide (English)
- `HUONG_DAN_THEM_LAYER.md` - Guide to add more layers (Vietnamese)

---

## 🔧 Troubleshooting

### Docker không start được

```bash
# Restart Docker Desktop qua UI
# Hoặc restart Docker service:
net stop com.docker.service
net start com.docker.service
```

### Port 8080 bị chiếm

```bash
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

### Container không start

```bash
# Xem logs
docker-compose logs
docker-compose logs webgis_backend
docker-compose logs webgis_postgis

# Restart containers
docker-compose restart
```

### Database connection error

```bash
# Vào PostgreSQL shell
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# Trong psql:
\dt       # List tables
\q        # Quit
```

### Migrations bị lỗi

```bash
# Reset migrations (CẢNH BÁO: Mất dữ liệu)
docker exec -it webgis_backend python manage.py migrate --fake-initial

# Hoặc reset toàn bộ database
docker-compose down -v
docker-compose up -d
# Rồi chạy lại setup script
```

---

## 📝 Thêm Layer Mới

Xem file `HUONG_DAN_THEM_LAYER.md` để biết chi tiết.

**Quick example:**

```bash
# 1. Chuẩn bị file GeoJSON trong sample_data/

# 2. Tạo model trong apps/gis_data/models.py

# 3. Run migrations
docker exec -it webgis_backend python manage.py makemigrations
docker exec -it webgis_backend python manage.py migrate

# 4. Import data (dùng Python shell hoặc tạo custom command)
docker exec -it webgis_backend python manage.py shell
```

---

## 💡 Next Steps

Sau khi setup xong PostGIS, bạn có thể:

1. **Thêm layers mới**: Follow `HUONG_DAN_THEM_LAYER.md`
2. **Customize frontend**: Edit `frontend/src/pages/MapViewer.jsx`
3. **Add GIS tools**: Extend `apps/tools/` (buffer, intersection, etc.)
4. **Create lessons**: Use Django admin to create classrooms and lessons
5. **Deploy**: Use docker-compose for production

---

## 📞 Liên hệ Claude

Khi restart xong và bắt đầu lại, chỉ cần nói:

**"Tôi đã restart máy xong, tiếp tục setup PostGIS"**

Claude sẽ biết tiếp tục từ đâu dựa vào file này.

---

🎉 **Good luck! Sau khi restart, mọi thứ sẽ chạy mượt hơn!**
