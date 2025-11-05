# 📚 Hướng Dẫn Thêm Layer & Dữ Liệu Mới - Chi Tiết Cho Người Mới

## 🎯 Mục Tiêu
Sau khi đọc xong, bạn sẽ biết:
1. **Bảng nào** cần thêm dữ liệu
2. **Cách thêm** layer mới (Point, Line, Polygon)
3. **Styling** - màu sắc cho từng feature
4. **Kiểm tra ngay** trên web sau khi thêm

---

## 🏗️ Kiến Trúc Hệ Thống (Đơn Giản)

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Leaflet)                             │
│  - Hiển thị bản đồ                                      │
│  - Có nút 🗺️ "Layers" để bật/tắt layer                 │
│  - Màu sắc: Hard-code trong getLayerStyle()            │
└──────────────┬──────────────────────────────────────────┘
               │ API: GET /api/v1/layers/
               │ API: GET /api/v1/layers/{id}/features/
┌──────────────▼──────────────────────────────────────────┐
│  BACKEND (Django REST API)                              │
│  - Đọc bảng gis_data_maplayer                          │
│  - Trả về GeoJSON từ data_source_table                 │
└──────────────┬──────────────────────────────────────────┘
               │ SQL Query
┌──────────────▼──────────────────────────────────────────┐
│  DATABASE (PostgreSQL + PostGIS)                        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │  gis_data_maplayer (Định nghĩa layers)    │        │
│  │  - id, name, data_source_table, geom_type │        │
│  └────────────────────────────────────────────┘        │
│                    ↓ data_source_table                  │
│  ┌────────────────────────────────────────────┐        │
│  │  vietnam_provinces (Dữ liệu tỉnh thành)   │        │
│  │  - id, name, code, geometry                │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │  points_of_interest (Điểm quan tâm)       │        │
│  │  - id, name, category, geometry            │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │  routes (Tuyến đường)                      │        │
│  │  - id, name, type, geometry                │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │  boundaries (Ranh giới)                    │        │
│  │  - id, name, type, geometry                │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Bảng Quan Trọng Cần Biết

### 1. **`gis_data_maplayer`** - Bảng Định Nghĩa Layer

**Vai trò:** Đây là "mục lục" của các layer. Frontend đọc bảng này để biết có những layer nào.

**Cấu trúc:**
```sql
CREATE TABLE gis_data_maplayer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),              -- Tên hiển thị (VD: "Trường học")
    data_source_table VARCHAR(100), -- Tên bảng chứa dữ liệu (VD: "schools")
    geom_type VARCHAR(50),          -- Loại geometry: POINT, LINESTRING, MULTIPOLYGON
    description TEXT,               -- Mô tả
    is_active BOOLEAN DEFAULT true, -- Bật/tắt layer
    created_at TIMESTAMP
);
```

**Ví dụ dữ liệu:**
| id | name | data_source_table | geom_type | is_active |
|----|------|------------------|-----------|-----------|
| 1 | Tỉnh thành Việt Nam | vietnam_provinces | MULTIPOLYGON | true |
| 2 | Điểm quan tâm | points_of_interest | POINT | true |
| 3 | Tuyến đường | routes | LINESTRING | true |

---

### 2. **Data Tables** - Bảng Chứa Dữ Liệu GIS

Đây là bảng chứa dữ liệu thực tế (tọa độ, tên, thông tin).

#### **points_of_interest** (Điểm quan tâm)
```sql
CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),      -- Tên địa điểm
    category VARCHAR(100),  -- Phân loại (Trường học, Bệnh viện...)
    description TEXT,       -- Mô tả
    geometry GEOMETRY(Point, 4326)  -- Tọa độ điểm
);
```

#### **routes** (Tuyến đường)
```sql
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(100),           -- Bus, Metro, Highway...
    length_km DECIMAL(10,2),
    geometry GEOMETRY(LineString, 4326)  -- Đường nối
);
```

#### **boundaries** (Ranh giới)
```sql
CREATE TABLE boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(100),           -- District, Province...
    population INTEGER,
    geometry GEOMETRY(MultiPolygon, 4326)  -- Vùng
);
```

---

## ⚙️ Tools (Buffer, Intersect) - KHÔNG CẦN THÊM VÀO DATABASE!

**Câu trả lời:** Tools là **API endpoints**, không lưu trong database.

**Cách hoạt động:**
1. User vẽ shape trên map
2. Frontend gửi GeoJSON đến API: `POST /api/v1/tools/buffer/`
3. Backend tính toán và trả kết quả
4. Frontend hiển thị kết quả

**Code backend:** `apps/tools/views.py`

➡️ **Bạn KHÔNG CẦN thêm gì vào database cho tools!**

---

## 🚀 Quy Trình Thêm Layer Mới (3 Bước)

### ✅ Bước 1: Tạo Bảng GIS Mới

Tạo bảng chứa dữ liệu với cột `geometry`.

**Ví dụ: Thêm layer "Trường học"**

```sql
-- Bước 1.1: Tạo bảng
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),           -- Tiểu học, THCS, THPT...
    student_count INTEGER,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(Point, 4326)  -- Vị trí trường
);

-- Bước 1.2: Tạo spatial index (tăng tốc query)
CREATE INDEX idx_schools_geometry ON schools USING GIST (geometry);
```

---

### ✅ Bước 2: Thêm Dữ Liệu Vào Bảng

```sql
-- Thêm dữ liệu mẫu
INSERT INTO schools (name, type, student_count, address, geometry)
VALUES
    ('THPT Trần Phú', 'THPT', 1200, 'Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),

    ('THCS Nguyễn Du', 'THCS', 800, 'Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0334]}')),

    ('THPT Lê Hồng Phong', 'THPT', 1500, 'TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981,10.7720]}'));
```

**💡 Lấy tọa độ từ đâu?**
- **Cách 1:** https://geojson.io (vẽ điểm → copy GeoJSON)
- **Cách 2:** Google Maps (click chuột phải → copy tọa độ → đảo ngược [lng, lat])

---

### ✅ Bước 3: Đăng Ký Layer Vào `gis_data_maplayer`

```sql
-- Thêm layer mới vào hệ thống
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Trường học', 'schools', 'POINT', 'Các trường học trên địa bàn', true);
```

**Giải thích:**
- `name`: Tên hiển thị trên frontend (checkbox)
- `data_source_table`: Tên bảng vừa tạo (`schools`)
- `geom_type`: `POINT` (vì trường học là điểm)
- `is_active`: `true` (layer sẽ hiển thị)

---

## 🎨 Styling - Màu Sắc Layer

### ⚠️ VẤN ĐỀ HIỆN TẠI:

Frontend hiện tại **tất cả layer đều CÙNG MÀU** (xanh dương `#3498db`):

```javascript
// File: frontend/src/pages/MapViewer.jsx (dòng 151-157)
const getLayerStyle = (feature) => ({
    fillColor: '#3498db',      // ← TẤT CẢ đều màu xanh!
    weight: 2,
    opacity: 1,
    color: '#2980b9',
    fillOpacity: 0.3,
});
```

---

### 💡 GIẢI PHÁP 1: Màu Theo Category/Type

Để **mỗi loại trường màu khác nhau** (THPT màu đỏ, THCS màu xanh):

#### Bước 1: Lưu thông tin phân loại trong database

```sql
-- Đã có trong bảng schools
INSERT INTO schools (name, type, ...) VALUES (..., 'THPT', ...);
```

#### Bước 2: Sửa frontend

Thêm vào SQL query để trả về property `type`:

```sql
-- File backend: apps/gis_data/views.py (line 96-99)
-- Sửa query để bao gồm type:
'properties', json_build_object(
    'id', id,
    'name', name,
    'category', COALESCE(category, 'Unknown'),
    'type', type  -- ← THÊM DÒNG NÀY
)
```

Sau đó sửa frontend:

```javascript
// File: frontend/src/pages/MapViewer.jsx
const getLayerStyle = (feature) => {
    const type = feature.properties.type || feature.properties.category;

    // Màu theo loại
    const colorMap = {
        'THPT': '#e74c3c',      // Đỏ
        'THCS': '#3498db',      // Xanh dương
        'Tiểu học': '#2ecc71',  // Xanh lá
        'Bệnh viện': '#9b59b6', // Tím
        'Chợ': '#f39c12',       // Cam
    };

    const color = colorMap[type] || '#95a5a6';  // Xám mặc định

    return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: color,
        fillOpacity: 0.5,
    };
};
```

---

### 💡 GIẢI PHÁP 2: Màu Theo Từng Feature (Mỗi Tỉnh Khác Màu)

Để **mỗi tỉnh có màu riêng**:

#### Cách 1: Lưu màu trong database

```sql
-- Thêm cột color vào bảng
ALTER TABLE vietnam_provinces ADD COLUMN color VARCHAR(7);

-- Cập nhật màu cho từng tỉnh
UPDATE vietnam_provinces SET color = '#FF6B6B' WHERE code = 'HN';
UPDATE vietnam_provinces SET color = '#4ECDC4' WHERE code = 'HCM';
UPDATE vietnam_provinces SET color = '#FFE66D' WHERE code = 'DN';
```

Sửa backend để trả về color:

```sql
-- apps/gis_data/views.py
'properties', json_build_object(
    'id', id,
    'name', name,
    'code', code,
    'color', color  -- ← THÊM DÒNG NÀY
)
```

Sửa frontend:

```javascript
const getLayerStyle = (feature) => {
    const color = feature.properties.color || '#3498db';

    return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: color,
        fillOpacity: 0.5,
    };
};
```

#### Cách 2: Random màu (nhanh nhất)

```javascript
const getLayerStyle = (feature) => {
    // Generate màu từ ID hoặc name
    const hash = feature.properties.id || 0;
    const hue = (hash * 137) % 360;  // Golden angle
    const color = `hsl(${hue}, 70%, 60%)`;

    return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: color,
        fillOpacity: 0.5,
    };
};
```

---

## 🧪 Kiểm Tra Ngay Sau Khi Thêm

### Bước 1: Kiểm tra trong pgAdmin

```sql
-- Kiểm tra layer đã có trong danh sách chưa?
SELECT * FROM gis_data_maplayer;

-- Kiểm tra dữ liệu trong bảng
SELECT id, name, type, ST_AsText(geometry) as location FROM schools;

-- Kiểm tra số lượng records
SELECT COUNT(*) FROM schools;
```

---

### Bước 2: Kiểm tra API

#### 2.1. Kiểm tra danh sách layers

```bash
curl http://localhost:8080/api/v1/layers/
```

**Kết quả mong đợi:**
```json
{
    "results": [
        {"id": 1, "name": "Tỉnh thành Việt Nam", ...},
        {"id": 2, "name": "Điểm quan tâm", ...},
        {"id": 4, "name": "Trường học", ...}  ← Layer mới!
    ]
}
```

#### 2.2. Kiểm tra features của layer

```bash
curl http://localhost:8080/api/v1/layers/4/features/
```

**Kết quả mong đợi:**
```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": 1,
            "properties": {
                "name": "THPT Trần Phú",
                "type": "THPT",
                "category": "Trường học"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [105.8342, 21.0278]
            }
        }
    ]
}
```

---

### Bước 3: Kiểm tra trên Web

1. Mở frontend: **http://localhost:3000**
2. Click nút **🗺️ Layers**
3. Tìm checkbox **"Trường học"** ← Layer mới
4. **Tick checkbox** → Các điểm trường học sẽ hiển thị ngay!
5. Click vào điểm → Xem thông tin popup

**Nếu KHÔNG THẤY:**
- Kiểm tra Console (F12) xem có lỗi API không
- Kiểm tra `is_active = true` trong database
- Refresh lại trang (Ctrl+F5)

---

## 📝 VÍ DỤ HOÀN CHỈNH: Thêm Layer "Bệnh Viện"

Copy toàn bộ SQL này vào pgAdmin:

```sql
-- ==========================================
-- VÍ DỤ: THÊM LAYER "BỆNH VIỆN"
-- ==========================================

-- Bước 1: Tạo bảng
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),           -- Bệnh viện đa khoa, chuyên khoa...
    capacity INTEGER,            -- Số giường bệnh
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(Point, 4326)
);

CREATE INDEX idx_hospitals_geometry ON hospitals USING GIST (geometry);

-- Bước 2: Thêm dữ liệu
INSERT INTO hospitals (name, type, capacity, address, geometry)
VALUES
    ('Bệnh viện Bạch Mai', 'Đa khoa', 2000, 'Đống Đa, Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8422,21.0026]}')),

    ('Bệnh viện Việt Đức', 'Đa khoa', 1000, 'Ba Đình, Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0267]}')),

    ('Bệnh viện Chợ Rẫy', 'Đa khoa', 2500, 'Quận 5, TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6568,10.7543]}')),

    ('Bệnh viện Đại học Y Dược', 'Đa khoa', 800, 'Quận 10, TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6687,10.7692]}')),

    ('Bệnh viện C Đà Nẵng', 'Đa khoa', 600, 'Hải Châu, Đà Nẵng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2134,16.0598]}'));

-- Bước 3: Đăng ký layer
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Bệnh viện', 'hospitals', 'POINT', 'Các bệnh viện trên địa bàn', true);

-- ==========================================
-- KIỂM TRA
-- ==========================================

-- Kiểm tra dữ liệu
SELECT name, type, capacity, ST_AsText(geometry) FROM hospitals;

-- Kiểm tra layer
SELECT * FROM gis_data_maplayer WHERE name = 'Bệnh viện';

-- Kiểm tra số lượng
SELECT
    (SELECT COUNT(*) FROM hospitals) as total_hospitals,
    (SELECT COUNT(*) FROM gis_data_maplayer WHERE is_active = true) as total_active_layers;
```

**Kết quả:**
- ✅ Bảng `hospitals` với 5 bệnh viện
- ✅ Layer "Bệnh viện" đã đăng ký
- ✅ Refresh frontend → Thấy checkbox "Bệnh viện"
- ✅ Tick checkbox → Hiển thị 5 điểm bệnh viện

---

## 🎯 VÍ DỤ: Thêm Layer Line (Tuyến Metro Mới)

```sql
-- Thêm tuyến metro mới
INSERT INTO routes (name, type, length_km, geometry)
VALUES
    ('Tuyến Metro số 2 - TP.HCM', 'Metro', 11.3,
     ST_GeomFromGeoJSON('{
         "type":"LineString",
         "coordinates":[
             [106.6951,10.7714],
             [106.7012,10.7726],
             [106.7089,10.7745],
             [106.7156,10.7698]
         ]
     }'));

-- Layer "Tuyến đường" đã có sẵn → KHÔNG CẦN tạo layer mới!
-- Chỉ cần thêm dữ liệu vào bảng routes
```

**Kết quả:** Refresh web → Tick layer "Tuyến đường" → Thấy tuyến metro mới!

---

## 🎯 VÍ DỤ: Thêm Layer Polygon (Khu Bảo Tồn)

```sql
-- Bước 1: Tạo bảng
CREATE TABLE protected_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),           -- Vườn quốc gia, Khu bảo tồn...
    area_km2 DECIMAL(10,2),
    established_year INTEGER,
    description TEXT,
    geometry GEOMETRY(MultiPolygon, 4326)
);

CREATE INDEX idx_protected_areas_geometry ON protected_areas USING GIST (geometry);

-- Bước 2: Thêm dữ liệu (vùng hình chữ nhật đơn giản)
INSERT INTO protected_areas (name, type, area_km2, established_year, description, geometry)
VALUES
    ('Vườn quốc gia Cúc Phương', 'Vườn quốc gia', 222.0, 1962,
     'Vườn quốc gia đầu tiên của Việt Nam',
     ST_GeomFromGeoJSON('{
         "type":"MultiPolygon",
         "coordinates":[[
             [[105.55,20.25],[105.65,20.25],[105.65,20.35],[105.55,20.35],[105.55,20.25]]
         ]]
     }'));

-- Bước 3: Đăng ký layer
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Khu bảo tồn', 'protected_areas', 'MULTIPOLYGON', 'Các khu bảo tồn thiên nhiên', true);
```

---

## ❌ Lỗi Thường Gặp

### Lỗi 1: "relation does not exist"

**Nguyên nhân:** Backend không tìm thấy bảng.

**Giải pháp:**
```sql
-- Kiểm tra tên bảng chính xác
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Đảm bảo data_source_table khớp với tên bảng
SELECT name, data_source_table FROM gis_data_maplayer;
```

---

### Lỗi 2: Layer không hiển thị trên web

**Checklist:**
1. ✅ `is_active = true`?
2. ✅ Bảng có dữ liệu?
3. ✅ `geometry IS NOT NULL`?
4. ✅ Refresh trang (Ctrl+F5)?

```sql
-- Kiểm tra
SELECT * FROM gis_data_maplayer WHERE is_active = false;  -- Tìm layer bị tắt
UPDATE gis_data_maplayer SET is_active = true WHERE id = 4;  -- Bật layer
```

---

### Lỗi 3: Màu sắc không đúng

**Nguyên nhân:** Frontend chưa sửa `getLayerStyle()`.

**Giải pháp:** Sửa file `frontend/src/pages/MapViewer.jsx` (xem phần Styling ở trên).

---

## 📊 Tóm Tắt Quy Trình

```
1. Tạo bảng GIS
   ↓
   CREATE TABLE my_table (
       id SERIAL,
       name VARCHAR(255),
       geometry GEOMETRY(Point/LineString/MultiPolygon, 4326)
   );

2. Thêm dữ liệu
   ↓
   INSERT INTO my_table (name, geometry)
   VALUES ('Name', ST_GeomFromGeoJSON('{"type":"Point",...}'));

3. Đăng ký layer
   ↓
   INSERT INTO gis_data_maplayer (name, data_source_table, geom_type)
   VALUES ('Layer Name', 'my_table', 'POINT');

4. Kiểm tra
   ↓
   - pgAdmin: SELECT * FROM my_table;
   - API: curl http://localhost:8080/api/v1/layers/
   - Web: Refresh → Tick checkbox → Xem layer mới!
```

---

## 🎉 Chúc Mừng!

Bạn đã biết cách:
- ✅ Tạo bảng GIS mới
- ✅ Thêm dữ liệu (Point, Line, Polygon)
- ✅ Đăng ký layer để hiển thị trên web
- ✅ Styling màu sắc
- ✅ Kiểm tra ngay trên web

**Bây giờ bạn có thể tự thêm layer mới bất cứ lúc nào!** 🚀
