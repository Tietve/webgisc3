# 🗺️ WebGIS PostGIS Setup Guide

## ✅ Những Gì Đã Chuẩn Bị Sẵn

1. **Docker Configuration** - `docker-compose.yml` với PostGIS
2. **CORS Settings** - Đã cấu hình trong `config/settings/development.py`
3. **Sample Data** - 10 tỉnh Việt Nam trong `sample_data/vietnam_provinces.geojson`
4. **Import Command** - `apps/gis_data/management/commands/import_provinces.py`
5. **Demo Users Script** - `create_demo_users.py`
6. **Setup Script** - `setup_postgis.sh`
7. **Documentation** - `HUONG_DAN_THEM_LAYER.md`

## 🚀 Cách Chạy (Khi Docker Build Xong)

### Bước 1: Kiểm Tra Docker Containers

```bash
docker ps
```

Bạn sẽ thấy 2 containers:
- `webgis_backend` - Django với GeoDjango
- `webgis_postgis` - PostgreSQL + PostGIS

### Bước 2: Chạy Setup Script

```bash
# Option 1: Chạy toàn bộ setup script
docker exec -it webgis_backend bash setup_postgis.sh

# Option 2: Chạy từng lệnh
docker exec -it webgis_backend python manage.py makemigrations
docker exec -it webgis_backend python manage.py migrate
docker exec -it webgis_backend python create_demo_users.py
docker exec -it webgis_backend python manage.py import_provinces
```

### Bước 3: Kiểm Tra API

```bash
# Test layers API
curl http://localhost:8080/api/v1/layers/

# Test login
curl -X POST http://localhost:8080/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"teacher123"}'
```

### Bước 4: Truy Cập Ứng Dụng

1. **Frontend**: http://localhost:3001
   - Login: teacher@example.com / teacher123

2. **Django Admin**: http://localhost:8080/admin
   - Login: admin@example.com / admin123

3. **API Docs**: http://localhost:8080/api/schema/swagger-ui/

## 📊 Test GIS Features

### 1. Xem Layers trong Frontend

1. Đăng nhập vào http://localhost:3001
2. Click vào Map Viewer
3. Click nút 🗺️ (Layers) ở góc trên bên trái
4. Bạn sẽ thấy layer "Tỉnh Thành Việt Nam"
5. Tick chọn để hiển thị trên bản đồ

### 2. Test API Endpoints

```bash
# Get access token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"teacher123"}' | jq -r '.access')

# List layers
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/layers/

# Get layer features (GeoJSON)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/layers/1/features/"

# Get features with bbox filter
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/layers/1/features/?bbox=105,20,107,22"
```

### 3. Test trong Django Admin

1. Vào http://localhost:8080/admin
2. Login: admin@example.com / admin123
3. Navigate: GIS Data → Map Layers
4. Bạn sẽ thấy layer "Tỉnh Thành Việt Nam"
5. Navigate: GIS Data → Vietnam Provinces
6. Xem 10 tỉnh đã import

## 🎯 Thêm Layer Mới

Xem file `HUONG_DAN_THEM_LAYER.md` để biết chi tiết cách thêm layer mới.

### Quick Example: Thêm Layer "Cities"

```bash
# 1. Tạo file GeoJSON
cat > sample_data/cities.geojson <<'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {"name": "Hà Nội", "population": 8053663},
      "geometry": {"type": "Point", "coordinates": [105.8342, 21.0278]}
    }
  ]
}
EOF

# 2. Vào Django shell
docker exec -it webgis_backend python manage.py shell

# 3. Import data
import json
from django.contrib.gis.geos import Point
from apps.gis_data.models import MapLayer

# Create layer
layer = MapLayer.objects.create(
    name="Cities",
    data_source_table="cities",
    geom_type="POINT",
    is_active=True
)

# Note: Bạn cần tạo model City trong apps/gis_data/models.py
```

## 🔧 Troubleshooting

### Docker build quá lâu
- Build PostGIS image mất 5-10 phút là bình thường
- Nếu quá 15 phút, thử: `docker system prune -a` và build lại

### Containers không start
```bash
docker-compose logs
docker-compose logs webgis_backend
docker-compose logs webgis_postgis
```

### Database connection error
```bash
# Check PostGIS container
docker exec -it webgis_postgis psql -U webgis_user -d webgis_db

# In psql:
\dt  # List tables
\q   # Quit
```

### Frontend không kết nối được backend
- Kiểm tra CORS settings trong `config/settings/development.py`
- Kiểm tra port 8080 đang mở: `netstat -ano | findstr :8080`

### Layer không hiển thị trên bản đồ
- Kiểm tra `is_active=True` trong MapLayer
- Kiểm tra có dữ liệu trong bảng: `docker exec -it webgis_backend python manage.py shell`
  ```python
  from apps.gis_data.models import VietnamProvince
  print(VietnamProvince.objects.count())
  ```

## 📝 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Teacher | teacher@example.com | teacher123 |
| Student | student@example.com | student123 |

## 🗂️ Project Structure

```
D:\Webgis\
├── apps/
│   ├── gis_data/              # GIS layer models & views
│   │   ├── models.py          # MapLayer, VietnamProvince
│   │   ├── views.py           # Layer API endpoints
│   │   └── management/
│   │       └── commands/
│   │           └── import_provinces.py
│   ├── tools/                 # GIS analysis tools
│   ├── users/                 # Authentication
│   ├── classrooms/            # Classroom management
│   ├── lessons/               # Lesson content
│   └── quizzes/               # Quiz system
│
├── config/
│   ├── settings/
│   │   ├── base.py           # Base settings
│   │   ├── development.py    # Dev settings (with CORS)
│   │   └── simple.py         # Simple mode (no PostGIS)
│   └── urls.py               # URL routing
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── MapViewer.jsx # Map with layers
│       └── api/
│           └── api.js        # API client
│
├── sample_data/
│   └── vietnam_provinces.geojson  # Demo GIS data
│
├── docker-compose.yml        # PostGIS setup
├── Dockerfile                # Django + GeoDjango
├── create_demo_users.py      # User creation script
├── setup_postgis.sh          # Complete setup script
└── HUONG_DAN_THEM_LAYER.md   # Layer guide (Vietnamese)
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/token/` | POST | Login |
| `/api/v1/auth/register/` | POST | Register |
| `/api/v1/layers/` | GET | List all layers |
| `/api/v1/layers/{id}/` | GET | Layer details |
| `/api/v1/layers/{id}/features/` | GET | GeoJSON features |
| `/api/v1/tools/buffer/execute/` | POST | Buffer analysis |
| `/api/v1/classrooms/` | GET | List classrooms |
| `/api/v1/lessons/` | GET | List lessons |

## 💡 Next Steps

1. **Add More Layers**: Follow `HUONG_DAN_THEM_LAYER.md`
2. **Customize Styles**: Edit `frontend/src/pages/MapViewer.jsx`
3. **Add More Tools**: Extend `apps/tools/`
4. **Deploy**: Use docker-compose for production

## 📞 Support

Nếu gặp vấn đề, check:
1. Docker logs: `docker-compose logs`
2. Backend logs: `docker exec -it webgis_backend tail -f logs/django.log`
3. Database: `docker exec -it webgis_postgis psql -U webgis_user -d webgis_db`

---

🎉 **Chúc bạn sử dụng WebGIS thành công!**
