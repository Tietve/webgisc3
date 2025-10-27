# 🗺️ Hướng Dẫn Các Loại Geometry trong WebGIS

Database đã có sẵn **3 tables** cho 3 loại hình học GIS phổ biến. **KHÔNG cần tạo table mới!**

---

## 📊 Tổng Quan 3 Tables

| Table | Geometry Type | Dùng Cho | API Layer ID |
|-------|---------------|----------|--------------|
| `points_of_interest` | **POINT** | Điểm đơn (trường học, bệnh viện, chợ, hồ...) | 1 |
| `routes` | **LINESTRING** | Đường nối (tuyến xe bus, metro, đường bộ...) | 3 |
| `boundaries` | **MULTIPOLYGON** | Vùng/Ranh giới (tỉnh, huyện, xã, khu vực...) | 2 |

---

## 1️⃣ POINT - Điểm đơn (points_of_interest)

### Cấu trúc table:
```
id          : auto increment
name        : tên điểm
category    : phân loại (Trường học, Hồ nước, Chợ, Bệnh viện...)
description : mô tả
geometry    : POINT(kinh_độ vĩ_độ)
created_at  : timestamp
```

### Ví dụ: Thêm Trường Học
```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Trường THPT Chu Văn An',
    'Trường học',
    'Trường trung học phổ thông tại Hà Nội',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')
);
```

### Ví dụ: Thêm Bệnh viện
```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Bệnh viện Bạch Mai',
    'Bệnh viện',
    'Bệnh viện đa khoa hạng đặc biệt',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8436,21.0031]}')
);
```

---

## 2️⃣ LINESTRING - Đường nối (routes)

### Cấu trúc table:
```
id         : auto increment
name       : tên tuyến
type       : loại (Bus, Metro, Highway...)
length_km  : độ dài (km)
geometry   : LINESTRING(nhiều điểm nối nhau)
created_at : timestamp
```

### Ví dụ: Thêm Tuyến Bus
```sql
INSERT INTO routes (name, type, length_km, geometry)
VALUES (
    'Tuyến Bus 01',
    'Bus',
    12.5,
    ST_GeomFromGeoJSON('{
        "type": "LineString",
        "coordinates": [
            [105.8342, 21.0278],
            [105.8456, 21.0312],
            [105.8567, 21.0245],
            [105.8623, 21.0189]
        ]
    }')
);
```

### Ví dụ: Thêm Đường Cao Tốc
```sql
INSERT INTO routes (name, type, length_km, geometry)
VALUES (
    'Cao tốc Hà Nội - Hải Phòng',
    'Highway',
    105.5,
    ST_GeomFromGeoJSON('{
        "type": "LineString",
        "coordinates": [
            [105.8342, 21.0278],
            [106.1234, 20.9876],
            [106.6845, 20.8456]
        ]
    }')
);
```

**Lưu ý:** LineString cần **ít nhất 2 điểm** để tạo thành đường nối.

---

## 3️⃣ MULTIPOLYGON - Vùng/Ranh giới (boundaries)

### Cấu trúc table:
```
id         : auto increment
name       : tên vùng
type       : loại (Province, District, Ward...)
code       : mã hành chính
population : dân số
area_km2   : diện tích (km²)
geometry   : MULTIPOLYGON(nhiều đa giác)
created_at : timestamp
```

### Ví dụ: Thêm Ranh giới Quận
```sql
INSERT INTO boundaries (name, type, code, population, area_km2, geometry)
VALUES (
    'Quận Hoàn Kiếm',
    'District',
    'HK01',
    150000,
    5.29,
    ST_GeomFromGeoJSON('{
        "type": "MultiPolygon",
        "coordinates": [[
            [
                [105.8342, 21.0378],
                [105.8542, 21.0378],
                [105.8542, 21.0178],
                [105.8342, 21.0178],
                [105.8342, 21.0378]
            ]
        ]]
    }')
);
```

### Ví dụ: Thêm Ranh giới Tỉnh
```sql
INSERT INTO boundaries (name, type, code, population, area_km2, geometry)
VALUES (
    'Tỉnh Hà Nam',
    'Province',
    'HN',
    850000,
    860.5,
    ST_GeomFromGeoJSON('{
        "type": "MultiPolygon",
        "coordinates": [[
            [
                [105.9, 20.5],
                [106.1, 20.5],
                [106.1, 20.3],
                [105.9, 20.3],
                [105.9, 20.5]
            ]
        ]]
    }')
);
```

**Lưu ý:**
- Polygon cần **ít nhất 4 điểm** (điểm đầu = điểm cuối để tạo vùng kín)
- Tọa độ phải đi **theo chiều kim đồng hồ** hoặc ngược chiều kim đồng hồ nhất quán

---

## 🛠️ Cách Lấy Tọa Độ

### Từ geojson.io:
1. Truy cập: https://geojson.io
2. Vẽ điểm/đường/vùng trên bản đồ
3. Copy phần GeoJSON bên phải
4. Dùng trong SQL: `ST_GeomFromGeoJSON('...')`

### Ví dụ GeoJSON từ geojson.io:
```json
{
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Point",
    "coordinates": [105.8342, 21.0278]
  }
}
```

Chỉ lấy phần `geometry`:
```sql
ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')
```

---

## 📋 Kiểm Tra Dữ Liệu

### Xem tất cả Points:
```sql
SELECT id, name, category, ST_AsText(geometry) as toa_do
FROM points_of_interest;
```

### Xem tất cả Routes:
```sql
SELECT id, name, type, length_km, ST_AsText(geometry) as duong_di
FROM routes;
```

### Xem tất cả Boundaries:
```sql
SELECT id, name, type, population, area_km2, ST_AsText(geometry) as ranh_gioi
FROM boundaries;
```

---

## 🎯 API Endpoints

Sau khi thêm dữ liệu, frontend sẽ tự động load từ API:

- **Layer 1 (Points):** http://localhost:8080/api/v1/layers/1/features/
- **Layer 2 (Boundaries):** http://localhost:8080/api/v1/layers/2/features/
- **Layer 3 (Routes):** http://localhost:8080/api/v1/layers/3/features/

---

## ✅ Tóm Tắt

**KHÔNG cần tạo table mới!** Chỉ cần:

1. Xác định loại geometry (Point/Line/Polygon)
2. INSERT vào table tương ứng:
   - Point → `points_of_interest`
   - LineString → `routes`
   - MultiPolygon → `boundaries`
3. Refresh frontend để xem kết quả

**Categories quan trọng cho Points:**
- `category = 'Trường học'` → icon trường học
- `category = 'Hồ nước'` → icon hồ nước
- `category = 'Bệnh viện'` → icon bệnh viện
- `category = 'Chợ'` → icon chợ

Frontend sẽ tự động hiển thị icon khác nhau dựa vào `category`!
