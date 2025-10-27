# Hướng Dẫn Thêm GIS Layers Vào Database

## 1. Cấu Trúc Dữ Liệu

Hệ thống sử dụng 2 loại bảng:

### A. Bảng MapLayer (Metadata)
Lưu thông tin về layer:
```python
name: str             # Tên hiển thị (VD: "Tỉnh Việt Nam")
data_source_table: str # Tên bảng chứa dữ liệu (VD: "vietnam_provinces")
geom_type: str        # Loại hình học: POINT, LINESTRING, POLYGON, MULTIPOLYGON, etc.
description: str      # Mô tả layer
is_active: bool       # Hiển thị hay không
```

### B. Bảng Dữ Liệu (VD: VietnamProvince)
Lưu dữ liệu thực tế với trường PostGIS:
```python
name: str                      # Tên tỉnh
code: str                      # Mã tỉnh
geometry: MultiPolygonField    # Hình học PostGIS
# + các thuộc tính khác (population, area_km2, etc.)
```

## 2. Định Dạng Dữ Liệu: GeoJSON

GeoJSON là định dạng chuẩn để lưu trữ dữ liệu GIS:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Hà Nội",
        "code": "HN",
        "population": 8053663
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[105.6, 20.9], [105.6, 21.2], [106.0, 21.2], [106.0, 20.9], [105.6, 20.9]]]
        ]
      }
    }
  ]
}
```

### Các Loại Geometry:
- **Point**: `{"type": "Point", "coordinates": [lon, lat]}`
- **LineString**: `{"type": "LineString", "coordinates": [[lon1, lat1], [lon2, lat2], ...]}`
- **Polygon**: `{"type": "Polygon", "coordinates": [[[lon, lat], ...]]}`
- **MultiPolygon**: `{"type": "MultiPolygon", "coordinates": [[[[lon, lat], ...]]]}`

## 3. Các Cách Thêm Layer

### Cách 1: Sử Dụng Management Command (Khuyên Dùng)

#### Bước 1: Chuẩn bị file GeoJSON
Tạo file `.geojson` trong thư mục `sample_data/`:
```bash
D:\Webgis\sample_data\my_layer.geojson
```

#### Bước 2: Chạy import command
```bash
# Vào container Django
docker exec -it webgis_backend bash

# Chạy import (với file mẫu sẵn có)
python manage.py import_provinces

# Hoặc import file khác
python manage.py import_provinces --file sample_data/my_layer.geojson
```

### Cách 2: Sử Dụng Django Admin

#### Bước 1: Truy cập Django Admin
```
http://localhost:8080/admin/
```

#### Bước 2: Tạo MapLayer mới
1. Vào "GIS Data" → "Map Layers" → "Add"
2. Điền thông tin:
   - Name: "Tỉnh Việt Nam"
   - Data source table: "vietnam_provinces"
   - Geom type: "MULTIPOLYGON"
   - Description: "Ranh giới hành chính các tỉnh"
   - Is active: ✓

#### Bước 3: Thêm dữ liệu vào bảng VietnamProvince
1. Vào "GIS Data" → "Vietnam Provinces" → "Add"
2. Điền thông tin và geometry (WKT format)

### Cách 3: Sử Dụng Python Shell

```bash
# Vào container và mở shell
docker exec -it webgis_backend bash
python manage.py shell
```

```python
import json
from django.contrib.gis.geos import GEOSGeometry
from apps.gis_data.models import VietnamProvince, MapLayer

# Đọc GeoJSON
with open('sample_data/vietnam_provinces.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Import từng feature
for feature in data['features']:
    props = feature['properties']
    geom = GEOSGeometry(json.dumps(feature['geometry']))

    VietnamProvince.objects.create(
        name=props['name'],
        code=props['code'],
        geometry=geom,
        # ... các field khác
    )

# Tạo MapLayer
MapLayer.objects.create(
    name='Tỉnh Thành Việt Nam',
    data_source_table='vietnam_provinces',
    geom_type='MULTIPOLYGON',
    is_active=True
)
```

### Cách 4: Sử Dụng API (Nếu có endpoint)

```bash
curl -X POST http://localhost:8080/api/v1/layers/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tỉnh Việt Nam",
    "data_source_table": "vietnam_provinces",
    "geom_type": "MULTIPOLYGON",
    "is_active": true
  }'
```

## 4. Lấy Dữ Liệu GeoJSON Từ Đâu?

### Nguồn dữ liệu miễn phí:

1. **Natural Earth Data** (https://www.naturalearthdata.com/)
   - Dữ liệu toàn cầu miễn phí
   - Có shapefile → cần convert sang GeoJSON

2. **GeoJSON.io** (https://geojson.io/)
   - Vẽ và xuất GeoJSON trực tiếp

3. **OpenStreetMap** (https://www.openstreetmap.org/)
   - Export dữ liệu từ OSM
   - Sử dụng Overpass API

4. **GADM** (https://gadm.org/)
   - Ranh giới hành chính các quốc gia
   - Download định dạng shapefile

### Convert Shapefile → GeoJSON:

```bash
# Sử dụng ogr2ogr (GDAL)
ogr2ogr -f GeoJSON output.geojson input.shp

# Hoặc online converter:
# https://mygeodata.cloud/converter/shp-to-geojson
```

## 5. Kiểm Tra Layer Đã Import

### Qua API:
```bash
# Lấy danh sách layers
curl http://localhost:8080/api/v1/layers/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy features của layer
curl "http://localhost:8080/api/v1/layers/1/features/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Qua Frontend:
1. Đăng nhập vào http://localhost:3001
2. Vào Map Viewer
3. Click nút 🗺️ (Layers)
4. Layer sẽ hiện trong danh sách
5. Tick chọn để hiển thị trên bản đồ

## 6. Ví Dụ: Thêm Layer "Trường Học"

### File GeoJSON: `sample_data/schools.geojson`
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "THPT Chu Văn An",
        "type": "high_school",
        "students": 1200
      },
      "geometry": {
        "type": "Point",
        "coordinates": [105.8342, 21.0278]
      }
    }
  ]
}
```

### Tạo Model: `apps/gis_data/models.py`
```python
class School(models.Model):
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)
    students = models.IntegerField()
    geometry = models.PointField(srid=4326)

    def __str__(self):
        return self.name
```

### Tạo Migration:
```bash
docker exec -it webgis_backend python manage.py makemigrations
docker exec -it webgis_backend python manage.py migrate
```

### Import Data:
Tạo command tương tự `import_provinces.py` hoặc dùng shell.

## 7. Tips & Best Practices

1. **SRID**: Luôn dùng SRID=4326 (WGS84) cho dữ liệu web
2. **Simplify Geometry**: Đơn giản hóa polygon phức tạp để tăng tốc
3. **Indexing**: PostGIS tự động tạo spatial index
4. **Validation**: Kiểm tra geometry hợp lệ trước khi import
5. **Backup**: Luôn backup database trước khi import dữ liệu lớn

## 8. Troubleshooting

### Lỗi: "geometry must be a MultiPolygon"
→ Convert Polygon sang MultiPolygon trong GeoJSON

### Lỗi: "SRID mismatch"
→ Đảm bảo geometry có SRID=4326

### Lỗi: "Invalid geometry"
→ Kiểm tra tọa độ hợp lệ (lon: -180 to 180, lat: -90 to 90)

### Layer không hiện trên bản đồ
→ Kiểm tra `is_active=True` và zoom đúng vùng

---

**Liên hệ hỗ trợ**: Nếu cần thêm hướng dẫn hoặc gặp lỗi, hãy cho biết!
