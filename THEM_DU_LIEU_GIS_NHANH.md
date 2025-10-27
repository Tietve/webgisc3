# Hướng Dẫn Thêm Dữ Liệu GIS Nhanh - Đã Setup Xong!

## ✅ Đã Hoàn Thành Tự Động

Database đã được setup hoàn chỉnh với:

**👥 Tài khoản:**
- Admin: `admin@webgis.com` / `admin123`
- Giáo viên: `teacher01@webgis.com` / `teacher123`
- Học sinh: `student01@webgis.com`, `student02@webgis.com`, `student03@webgis.com` / `student123`

**🏫 Dữ liệu mẫu:**
- 1 lớp học: "GIS Cơ Bản 101" (mã: GIS101)
- 3 bài học
- 3 học sinh đã đăng ký vào lớp

**🗺️ Bảng GIS sẵn sàng:**
- `points_of_interest` - Điểm quan tâm (Point) - đã có 3 điểm mẫu
- `boundaries` - Ranh giới (MultiPolygon) - chưa có dữ liệu
- `routes` - Tuyến đường (LineString) - chưa có dữ liệu

---

## 🚀 Bây Giờ Bạn Làm Gì?

### Bước 1: Vào pgAdmin

1. Mở trình duyệt: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@webgis.com`
   - Password: `admin123`

### Bước 2: Kết Nối Database

1. Click chuột phải **Servers** → **Create** → **Server**
2. Tab **General**: Name = `WebGIS Database`
3. Tab **Connection**:
   ```
   Host: db
   Port: 5432
   Database: webgis_db
   Username: webgis_user
   Password: webgis_password
   ✓ Save password
   ```
4. Click **Save**

### Bước 3: Mở Query Tool

1. Mở rộng: **Servers** → **WebGIS Database** → **Databases** → **webgis_db**
2. Click chuột phải vào **webgis_db** → **Query Tool**

---

## 📍 Thêm Điểm Quan Tâm (Points)

Bảng `points_of_interest` đã có sẵn, bạn chỉ cần thêm điểm mới:

### Cách 1: Lấy tọa độ từ geojson.io (Dễ nhất)

1. Mở: **https://geojson.io/**
2. Zoom đến khu vực bạn muốn (VD: Việt Nam)
3. Click nút **Add marker** (📍)
4. Click vào bản đồ để đánh dấu điểm
5. Bên phải sẽ hiện code GeoJSON, copy phần `coordinates`
6. Paste vào SQL dưới đây:

```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Tên điểm của bạn',
    'Loại (VD: Trường học, Bệnh viện, Chợ)',
    'Mô tả',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[KINH_ĐỘ, VĨ_ĐỘ]}')
);
```

### Ví dụ cụ thể:

```sql
-- Thêm nhiều điểm cùng lúc
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('THPT Chu Văn An', 'Trường học', 'Trường THPT tại Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342, 21.0278]}')),

    ('Bệnh viện Bạch Mai', 'Bệnh viện', 'Bệnh viện hạng đặc biệt',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8436, 21.0031]}')),

    ('Chợ Đồng Xuân', 'Chợ', 'Chợ lớn nhất Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8492, 21.0364]}'));

-- Xem kết quả
SELECT id, name, category, ST_AsText(geometry) as toa_do
FROM points_of_interest
ORDER BY id DESC;
```

### Cách 2: Lấy tọa độ từ Google Maps

1. Mở Google Maps
2. Click chuột phải vào điểm muốn lấy tọa độ
3. Click vào tọa độ để copy (VD: `21.028511, 105.804817`)
4. **ĐẢO NGƯỢC**: Kinh độ trước, vĩ độ sau → `[105.804817, 21.028511]`
5. Dùng trong SQL:

```sql
INSERT INTO points_of_interest (name, category, geometry)
VALUES (
    'Điểm từ Google Maps',
    'Địa điểm',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.804817, 21.028511]}')
);
```

---

## 📐 Thêm Ranh Giới (Boundaries - Polygon/MultiPolygon)

### Cách 1: Vẽ trên geojson.io

1. Truy cập: **https://geojson.io/**
2. Click nút **Draw a polygon** (📐)
3. Click các điểm để vẽ vùng, click lại điểm đầu để đóng
4. Copy code GeoJSON bên phải
5. Paste vào SQL:

```sql
INSERT INTO boundaries (name, type, code, geometry)
VALUES (
    'Quận Hoàn Kiếm',
    'Quận',
    'HK',
    ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.840, 21.020],
                [105.840, 21.035],
                [105.860, 21.035],
                [105.860, 21.020],
                [105.840, 21.020]
            ]
        ]]
    }')
);

-- Xem kết quả
SELECT id, name, type, ST_Area(geometry::geography) / 1000000 as dien_tich_km2
FROM boundaries;
```

### Lưu Ý Về Polygon:

- **Điểm đầu = Điểm cuối** (để đóng vùng)
- **MultiPolygon** có 4 dấu ngoặc: `[[[[...]]]]`
- **Polygon** có 3 dấu ngoặc: `[[[...]]]`
- Với boundaries table, luôn dùng **MultiPolygon**

### Ví dụ: Tạo vùng hình chữ nhật đơn giản

```sql
-- Vùng hình chữ nhật bao quanh Hồ Hoàn Kiếm
INSERT INTO boundaries (name, type, population, area_km2, geometry)
VALUES (
    'Khu vực Hồ Hoàn Kiếm',
    'Khu du lịch',
    NULL,
    0.5,
    ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.850, 21.025],
                [105.850, 21.030],
                [105.855, 21.030],
                [105.855, 21.025],
                [105.850, 21.025]
            ]
        ]]
    }')
);
```

---

## 📏 Thêm Tuyến Đường (Routes - LineString)

### Vẽ trên geojson.io

1. Truy cập: **https://geojson.io/**
2. Click nút **Draw a polyline** (📏)
3. Click các điểm để vẽ đường
4. Double-click để kết thúc
5. Copy GeoJSON:

```sql
INSERT INTO routes (name, type, length_km, geometry)
VALUES (
    'Đường Láng',
    'Đường phố',
    2.5,
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8020, 21.0245],
            [105.8100, 21.0280],
            [105.8180, 21.0315],
            [105.8250, 21.0350]
        ]
    }')
);

-- Xem kết quả
SELECT id, name, type, ST_Length(geometry::geography) / 1000 as chieu_dai_km
FROM routes;
```

### Ví dụ: Vẽ tuyến xe buýt

```sql
INSERT INTO routes (name, type, geometry)
VALUES
    ('Tuyến BRT Kim Mã - Yên Nghĩa', 'BRT',
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8200, 21.0300],
            [105.8150, 21.0250],
            [105.8100, 21.0200],
            [105.8050, 21.0150]
        ]
    }')),

    ('Tuyến Metro số 3', 'Metro',
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8400, 21.0200],
            [105.8450, 21.0180],
            [105.8500, 21.0160]
        ]
    }'));
```

---

## 🔍 Các Câu Lệnh Hữu Ích

### Xem tất cả dữ liệu

```sql
-- Xem điểm
SELECT id, name, category, ST_AsText(geometry) as toa_do
FROM points_of_interest
ORDER BY id;

-- Xem ranh giới
SELECT id, name, type,
       ST_Area(geometry::geography) / 1000000 as dien_tich_km2
FROM boundaries;

-- Xem tuyến đường
SELECT id, name, type,
       ST_Length(geometry::geography) / 1000 as chieu_dai_km
FROM routes;
```

### Xem dữ liệu dạng GeoJSON

```sql
SELECT id, name, ST_AsGeoJSON(geometry) as geojson
FROM points_of_interest;
```

### Tìm điểm gần nhất

```sql
-- Tìm 5 điểm gần vị trí (105.85, 21.03) nhất
SELECT
    name,
    category,
    ST_Distance(
        geometry::geography,
        ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.85, 21.03]}')::geography
    ) / 1000 as khoang_cach_km
FROM points_of_interest
ORDER BY geometry::geography <-> ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.85, 21.03]}')::geography
LIMIT 5;
```

### Tính diện tích

```sql
-- Tính diện tích các vùng (km²)
SELECT
    name,
    ST_Area(geometry::geography) / 1000000 as dien_tich_km2
FROM boundaries
ORDER BY dien_tich_km2 DESC;
```

### Kiểm tra điểm có nằm trong vùng không

```sql
-- Kiểm tra điểm Hồ Hoàn Kiếm có nằm trong vùng nào không
SELECT b.name as vung
FROM boundaries b
WHERE ST_Contains(
    b.geometry,
    (SELECT geometry FROM points_of_interest WHERE name = 'Hồ Hoàn Kiếm')
);
```

---

## 🎯 Ví Dụ Thực Tế: Tạo Bản Đồ Trường Học Hà Nội

```sql
-- 1. Thêm các trường học
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('THPT Chu Văn An', 'Trường học', 'Trường THPT công lập',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342, 21.0278]}')),

    ('THPT Nguyễn Huệ', 'Trường học', 'Trường THPT chuyên',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456, 21.0189]}')),

    ('THPT Chu Văn An', 'Trường học', 'Trường THPT công lập',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512, 21.0245]}'));

-- 2. Tạo ranh giới khu vực giáo dục
INSERT INTO boundaries (name, type, description, geometry)
VALUES (
    'Khu phố Văn',
    'Khu giáo dục',
    'Khu vực tập trung nhiều trường học',
    ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.830, 21.020],
                [105.830, 21.030],
                [105.860, 21.030],
                [105.860, 21.020],
                [105.830, 21.020]
            ]
        ]]
    }')
);

-- 3. Tạo tuyến xe buýt đi qua các trường
INSERT INTO routes (name, type, description, geometry)
VALUES (
    'Tuyến xe buýt số 38',
    'Xe buýt',
    'Tuyến đi qua các trường học',
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8300, 21.0200],
            [105.8342, 21.0278],
            [105.8456, 21.0189],
            [105.8512, 21.0245],
            [105.8600, 21.0300]
        ]
    }')
);

-- 4. Xem kết quả
SELECT
    'Trường học' as loai,
    COUNT(*) as so_luong
FROM points_of_interest WHERE category = 'Trường học'
UNION ALL
SELECT 'Khu vực giáo dục', COUNT(*) FROM boundaries WHERE type = 'Khu giáo dục'
UNION ALL
SELECT 'Tuyến xe buýt', COUNT(*) FROM routes WHERE type = 'Xe buýt';
```

---

## 💾 Sửa/Xóa Dữ Liệu

### Sửa dữ liệu

```sql
-- Sửa tên
UPDATE points_of_interest
SET name = 'Hồ Hoàn Kiếm - Hà Nội'
WHERE name = 'Hồ Hoàn Kiếm';

-- Sửa tọa độ
UPDATE points_of_interest
SET geometry = ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8525, 21.0290]}')
WHERE id = 1;
```

### Xóa dữ liệu

```sql
-- Xóa theo ID
DELETE FROM points_of_interest WHERE id = 5;

-- Xóa theo điều kiện
DELETE FROM points_of_interest WHERE category = 'Test';
```

---

## 🎨 Tips & Tricks

### 1. Tọa Độ Việt Nam

- **Kinh độ**: 102° - 110° E
- **Vĩ độ**: 8° - 24° N

Ví dụ:
- Hà Nội: `[105.85, 21.03]`
- TP.HCM: `[106.70, 10.77]`
- Đà Nẵng: `[108.22, 16.07]`

### 2. Validate Geometry

```sql
-- Kiểm tra geometry có hợp lệ không
SELECT id, name, ST_IsValid(geometry) as hop_le
FROM points_of_interest;

-- Sửa geometry không hợp lệ
UPDATE boundaries
SET geometry = ST_MakeValid(geometry)
WHERE NOT ST_IsValid(geometry);
```

### 3. Format GeoJSON Đúng

✅ **Đúng:**
```json
{"type":"Point","coordinates":[105.8342, 21.0278]}
```

❌ **Sai** (đảo ngược):
```json
{"type":"Point","coordinates":[21.0278, 105.8342]}
```

### 4. Copy Dữ Liệu Từ Bảng Khác

```sql
-- Copy điểm từ bảng khác
INSERT INTO points_of_interest (name, category, geometry)
SELECT ten_khac, loai_khac, geometry
FROM bang_khac;
```

---

## 📱 Vào Django Admin (Nếu Cần)

Nếu muốn quản lý users, classrooms, lessons qua giao diện:

1. Truy cập: **http://localhost:8080/admin/**
2. Đăng nhập: `admin@webgis.com` / `admin123`
3. Quản lý dữ liệu qua giao diện đẹp hơn

---

## 🔄 Chạy Lại Script Setup (Nếu Cần)

Nếu bạn muốn reset và chạy lại setup:

```bash
docker exec webgis_backend python setup_initial_data.py
```

Script sẽ tự động kiểm tra và chỉ tạo dữ liệu chưa có.

---

## 🎉 Kết Luận

Bây giờ bạn có thể:

✅ Vào pgAdmin và thêm dữ liệu GIS
✅ Thêm Point (điểm quan tâm)
✅ Thêm Polygon (ranh giới)
✅ Thêm LineString (tuyến đường)
✅ Xem và phân tích dữ liệu GIS

**Chúc bạn thành công!** 🚀

Nếu cần thêm trợ giúp, xem file:
- `DOCKER_GUIDE.md` - Hướng dẫn Docker
- `HUONG_DAN_THEM_DU_LIEU_VAO_BANG.md` - Chi tiết về các bảng
