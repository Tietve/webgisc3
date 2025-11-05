# 📝 Cheat Sheet - Thêm Layer Nhanh

## 🎯 3 BƯỚC DUY NHẤT

### 1️⃣ Tạo Bảng
```sql
CREATE TABLE ten_bang (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),           -- Phân loại (optional)
    description TEXT,
    geometry GEOMETRY(Point/LineString/MultiPolygon, 4326)
);
CREATE INDEX idx_ten_bang_geom ON ten_bang USING GIST (geometry);
```

### 2️⃣ Thêm Dữ Liệu
```sql
INSERT INTO ten_bang (name, category, geometry)
VALUES
    ('Địa điểm 1', 'Loại A',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('Địa điểm 2', 'Loại B',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981,10.7720]}'));
```

### 3️⃣ Đăng Ký Layer
```sql
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Tên Layer', 'ten_bang', 'POINT', 'Mô tả layer', true);
```

**✅ XONG! Refresh web → Tick checkbox → Xem layer!**

---

## 📍 POINT (Điểm)

```sql
-- Tạo
CREATE TABLE my_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geometry GEOMETRY(Point, 4326)
);
CREATE INDEX idx_my_points_geom ON my_points USING GIST (geometry);

-- Thêm
INSERT INTO my_points (name, geometry) VALUES
    ('Hà Nội', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('TP.HCM', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981,10.7720]}'));

-- Đăng ký
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active)
VALUES ('Điểm của tôi', 'my_points', 'POINT', true);
```

---

## 📏 LINESTRING (Đường)

```sql
-- Tạo
CREATE TABLE my_lines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geometry GEOMETRY(LineString, 4326)
);
CREATE INDEX idx_my_lines_geom ON my_lines USING GIST (geometry);

-- Thêm
INSERT INTO my_lines (name, geometry) VALUES
    ('Đường 1', ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[[105.8,21.0],[105.9,21.1],[106.0,21.2]]
    }'));

-- Đăng ký
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active)
VALUES ('Đường của tôi', 'my_lines', 'LINESTRING', true);
```

---

## 📐 MULTIPOLYGON (Vùng)

```sql
-- Tạo
CREATE TABLE my_polygons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    area_km2 DECIMAL(10,2),
    geometry GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX idx_my_polygons_geom ON my_polygons USING GIST (geometry);

-- Thêm (hình chữ nhật đơn giản)
INSERT INTO my_polygons (name, area_km2, geometry) VALUES
    ('Khu vực A', 100.0, ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[[[105.7,21.0],[105.9,21.0],[105.9,21.2],[105.7,21.2],[105.7,21.0]]]]
    }'));

-- Đăng ký
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active)
VALUES ('Khu vực của tôi', 'my_polygons', 'MULTIPOLYGON', true);
```

---

## 🎨 STYLING - Màu Sắc

### Cách 1: Thêm cột color
```sql
ALTER TABLE my_points ADD COLUMN color VARCHAR(7);
UPDATE my_points SET color = '#FF6B6B' WHERE name = 'Hà Nội';
UPDATE my_points SET color = '#4ECDC4' WHERE name = 'TP.HCM';
```

Sửa backend (`apps/gis_data/views.py` dòng 96):
```python
'properties', json_build_object(
    'id', id,
    'name', name,
    'category', COALESCE(category, 'Unknown'),
    'color', color  # ← THÊM DÒNG NÀY
)
```

Sửa frontend (`frontend/src/pages/MapViewer.jsx` dòng 151):
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

### Cách 2: Màu theo category
```javascript
const getLayerStyle = (feature) => {
    const category = feature.properties.category;
    const colorMap = {
        'Trường học': '#e74c3c',
        'Bệnh viện': '#9b59b6',
        'Chợ': '#f39c12',
    };
    const color = colorMap[category] || '#95a5a6';
    return { fillColor: color, weight: 2, color: color, fillOpacity: 0.5 };
};
```

---

## 🔍 KIỂM TRA

### Trong pgAdmin
```sql
-- Kiểm tra layers
SELECT * FROM gis_data_maplayer;

-- Kiểm tra dữ liệu
SELECT id, name, ST_AsText(geometry) FROM my_points;

-- Đếm records
SELECT COUNT(*) FROM my_points;

-- Kiểm tra geometry hợp lệ
SELECT name FROM my_points WHERE ST_IsValid(geometry) = false;
```

### API
```bash
# Danh sách layers
curl http://localhost:8080/api/v1/layers/

# Features của layer ID=4
curl http://localhost:8080/api/v1/layers/4/features/
```

### Web
1. Mở: http://localhost:3000
2. Click 🗺️
3. Tick checkbox layer mới
4. ✅ Xem dữ liệu!

---

## 🛠️ LÀM GÌ NẾU...

### ❌ Layer không hiển thị?
```sql
-- Kiểm tra is_active
SELECT name, is_active FROM gis_data_maplayer;

-- Bật layer
UPDATE gis_data_maplayer SET is_active = true WHERE id = 4;

-- Kiểm tra có dữ liệu?
SELECT COUNT(*) FROM my_points;
```

### ❌ Lỗi "relation does not exist"?
```sql
-- Kiểm tra tên bảng
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Sửa tên trong layer
UPDATE gis_data_maplayer SET data_source_table = 'ten_dung' WHERE id = 4;
```

### ❌ Geometry NULL?
```sql
-- Tìm records bị NULL
SELECT id, name FROM my_points WHERE geometry IS NULL;

-- Cập nhật lại
UPDATE my_points SET geometry = ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8,21.0]}') WHERE id = 1;
```

---

## 📊 TEMPLATE NHANH

### Trường học
```sql
CREATE TABLE schools (id SERIAL PRIMARY KEY, name VARCHAR(255), type VARCHAR(100), geometry GEOMETRY(Point, 4326));
CREATE INDEX idx_schools_geom ON schools USING GIST (geometry);
INSERT INTO schools (name, type, geometry) VALUES ('THPT A', 'THPT', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8,21.0]}'));
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active) VALUES ('Trường học', 'schools', 'POINT', true);
```

### Bệnh viện
```sql
CREATE TABLE hospitals (id SERIAL PRIMARY KEY, name VARCHAR(255), type VARCHAR(100), geometry GEOMETRY(Point, 4326));
CREATE INDEX idx_hospitals_geom ON hospitals USING GIST (geometry);
INSERT INTO hospitals (name, type, geometry) VALUES ('BV A', 'Đa khoa', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8,21.0]}'));
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active) VALUES ('Bệnh viện', 'hospitals', 'POINT', true);
```

### Tuyến bus
```sql
CREATE TABLE bus_routes (id SERIAL PRIMARY KEY, name VARCHAR(255), route_number VARCHAR(10), geometry GEOMETRY(LineString, 4326));
CREATE INDEX idx_bus_routes_geom ON bus_routes USING GIST (geometry);
INSERT INTO bus_routes (name, route_number, geometry) VALUES ('Tuyến 01', '01', ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[105.8,21.0],[105.9,21.1]]}'));
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active) VALUES ('Tuyến Bus', 'bus_routes', 'LINESTRING', true);
```

### Công viên
```sql
CREATE TABLE parks (id SERIAL PRIMARY KEY, name VARCHAR(255), area_km2 DECIMAL(10,2), geometry GEOMETRY(MultiPolygon, 4326));
CREATE INDEX idx_parks_geom ON parks USING GIST (geometry);
INSERT INTO parks (name, area_km2, geometry) VALUES ('Công viên A', 2.5, ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.8,21.0],[105.9,21.0],[105.9,21.1],[105.8,21.1],[105.8,21.0]]]]}'));
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active) VALUES ('Công viên', 'parks', 'MULTIPOLYGON', true);
```

---

## 🌍 LẤY TỌA ĐỘ

### Cách 1: geojson.io
1. Mở: https://geojson.io
2. Vẽ điểm/đường/vùng
3. Copy JSON bên phải
4. Paste vào `ST_GeomFromGeoJSON('...')`

### Cách 2: Google Maps
1. Click chuột phải → Copy tọa độ
2. Kết quả: `21.0278, 105.8342`
3. **ĐẢO NGƯỢC** thành: `[105.8342, 21.0278]` (lng, lat)
4. Tạo JSON: `{"type":"Point","coordinates":[105.8342,21.0278]}`

---

## ⚡ QUY TRÌNH NHANH NHẤT

```sql
-- Copy template này và sửa tên
CREATE TABLE YOUR_TABLE (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    geometry GEOMETRY(Point, 4326)
);
CREATE INDEX idx_YOUR_TABLE_geom ON YOUR_TABLE USING GIST (geometry);

INSERT INTO YOUR_TABLE (name, category, geometry) VALUES
    ('Item 1', 'Type A', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8,21.0]}')),
    ('Item 2', 'Type B', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.7,10.8]}'));

INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, is_active)
VALUES ('Layer Name', 'YOUR_TABLE', 'POINT', true);
```

**✅ XONG! 3 query = 1 layer mới!**
