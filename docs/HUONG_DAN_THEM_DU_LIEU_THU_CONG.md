# Hướng Dẫn Thêm Dữ Liệu GIS Thủ Công Vào Database

## Bước 1: Truy Cập pgAdmin

1. Mở trình duyệt, truy cập: **http://localhost:5050**

2. Đăng nhập với:
   - **Email**: `admin@webgis.com`
   - **Password**: `admin123`

## Bước 2: Kết Nối Database

1. Click chuột phải vào **Servers** (bên trái) → **Create** → **Server**

2. Trong cửa sổ mới:

   **Tab General:**
   - Name: `WebGIS Database`

   **Tab Connection:**
   - Host name/address: `db`
   - Port: `5432`
   - Maintenance database: `webgis_db`
   - Username: `webgis_user`
   - Password: `webgis_password`
   - ✓ Tích vào **Save password**

3. Click **Save**

## Bước 3: Mở Query Tool

1. Bên trái, mở rộng:
   ```
   Servers → WebGIS Database → Databases → webgis_db
   ```

2. Click chuột phải vào **webgis_db** → chọn **Query Tool**

3. Cửa sổ SQL editor sẽ mở ra - đây là nơi bạn sẽ viết các câu lệnh SQL

## Bước 4: Enable PostGIS Extension

Copy và paste vào Query Tool, nhấn **F5** hoặc nút ▶️ để chạy:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Kết quả: Sẽ hiện "Query returned successfully..."

## Bước 5: Tạo Bảng Để Lưu Dữ Liệu

### Ví Dụ 1: Bảng Lưu Điểm (Point)

```sql
-- Tạo bảng lưu các địa điểm (trường học, bệnh viện, ...)
CREATE TABLE dia_diem (
    id SERIAL PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    loai VARCHAR(100),
    dia_chi TEXT,
    mo_ta TEXT,
    geometry GEOMETRY(Point, 4326)
);
```

### Ví Dụ 2: Bảng Lưu Đường (LineString)

```sql
-- Tạo bảng lưu đường phố, sông
CREATE TABLE duong_pho (
    id SERIAL PRIMARY KEY,
    ten_duong VARCHAR(255) NOT NULL,
    loai_duong VARCHAR(100),
    chieu_dai_km DECIMAL(10,2),
    geometry GEOMETRY(LineString, 4326)
);
```

### Ví Dụ 3: Bảng Lưu Vùng (Polygon/MultiPolygon)

```sql
-- Tạo bảng lưu ranh giới tỉnh, huyện
CREATE TABLE ranh_gioi (
    id SERIAL PRIMARY KEY,
    ten_vung VARCHAR(255) NOT NULL,
    ma_vung VARCHAR(50),
    cap_hanh_chinh VARCHAR(50),
    dan_so INTEGER,
    dien_tich_km2 DECIMAL(10,2),
    geometry GEOMETRY(MultiPolygon, 4326)
);
```

**Chọn 1 trong 3 bảng trên** (hoặc tạo cả 3) và chạy câu lệnh SQL.

## Bước 6: Thêm Dữ Liệu Vào Bảng

### Cách Thêm Điểm (Point)

```sql
-- Thêm 1 điểm
INSERT INTO dia_diem (ten, loai, dia_chi, mo_ta, geometry)
VALUES (
    'Bệnh viện Bạch Mai',
    'Bệnh viện',
    '78 Giải Phóng, Hà Nội',
    'Bệnh viện hạng đặc biệt',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8436, 21.0031]}')
);

-- Thêm nhiều điểm cùng lúc
INSERT INTO dia_diem (ten, loai, dia_chi, geometry)
VALUES
    ('Hồ Hoàn Kiếm', 'Hồ nước', 'Hoàn Kiếm, Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0285]}')),

    ('Chợ Bến Thành', 'Chợ', 'Quận 1, TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981, 10.7720]}')),

    ('Phố cổ Hội An', 'Di tích', 'Hội An, Quảng Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.3277, 15.8801]}'));
```

**Lưu ý tọa độ:**
- Format: `[kinh_độ, vĩ_độ]` hoặc `[longitude, latitude]`
- Việt Nam: kinh độ khoảng 102-110, vĩ độ khoảng 8-24

### Cách Thêm Đường (LineString)

```sql
-- Thêm 1 đoạn đường
INSERT INTO duong_pho (ten_duong, loai_duong, geometry)
VALUES (
    'Đường Láng',
    'Đường chính',
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8020, 21.0245],
            [105.8100, 21.0280],
            [105.8180, 21.0315]
        ]
    }')
);

-- Thêm sông
INSERT INTO duong_pho (ten_duong, loai_duong, chieu_dai_km, geometry)
VALUES (
    'Sông Hồng',
    'Sông',
    1149.0,
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8200, 21.0500],
            [105.8300, 21.0450],
            [105.8400, 21.0400],
            [105.8500, 21.0350]
        ]
    }')
);
```

### Cách Thêm Vùng (Polygon/MultiPolygon)

```sql
-- Thêm 1 vùng đơn giản (hình chữ nhật)
INSERT INTO ranh_gioi (ten_vung, ma_vung, cap_hanh_chinh, geometry)
VALUES (
    'Quận Hoàn Kiếm',
    'HK',
    'Quận',
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

-- Thêm vùng phức tạp hơn
INSERT INTO ranh_gioi (ten_vung, ma_vung, cap_hanh_chinh, dan_so, dien_tich_km2, geometry)
VALUES (
    'Tỉnh Quảng Ninh',
    'QN',
    'Tỉnh',
    1320324,
    6102.0,
    ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [107.0, 20.8],
                [107.0, 21.3],
                [107.8, 21.3],
                [107.8, 20.8],
                [107.0, 20.8]
            ]
        ]]
    }')
);
```

**Lưu ý Polygon:**
- Điểm đầu và điểm cuối phải giống nhau (để đóng vùng)
- MultiPolygon có 4 dấu ngoặc `[[[[...]]]]`, Polygon có 3 dấu `[[[...]]]`

## Bước 7: Kiểm Tra Dữ Liệu Vừa Thêm

```sql
-- Xem tất cả dữ liệu trong bảng
SELECT * FROM dia_diem;

-- Xem dữ liệu với geometry dạng text (dễ đọc)
SELECT id, ten, loai, ST_AsText(geometry) as toa_do
FROM dia_diem;

-- Xem dữ liệu với geometry dạng GeoJSON
SELECT id, ten, loai, ST_AsGeoJSON(geometry) as geojson
FROM dia_diem;

-- Đếm số lượng record
SELECT COUNT(*) FROM dia_diem;
```

## Bước 8: Sửa/Xóa Dữ Liệu

### Sửa dữ liệu

```sql
-- Sửa tên
UPDATE dia_diem
SET ten = 'Bệnh viện Bạch Mai - Cơ sở 1'
WHERE id = 1;

-- Sửa tọa độ
UPDATE dia_diem
SET geometry = ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8500, 21.0050]}')
WHERE id = 1;
```

### Xóa dữ liệu

```sql
-- Xóa theo id
DELETE FROM dia_diem WHERE id = 1;

-- Xóa theo tên
DELETE FROM dia_diem WHERE ten = 'Hồ Hoàn Kiếm';

-- Xóa tất cả dữ liệu trong bảng (cẩn thận!)
DELETE FROM dia_diem;
```

## Bước 9: Lấy Tọa Độ GeoJSON Từ Đâu?

### Cách 1: Dùng geojson.io (Khuyên dùng!)

1. Truy cập: **https://geojson.io/**
2. Click vào bản đồ để vẽ:
   - 📍 **Point**: Click nút marker, click trên bản đồ
   - 📏 **LineString**: Click nút draw line, click nhiều điểm
   - 📐 **Polygon**: Click nút draw polygon, click các góc
3. Bên phải sẽ hiện code GeoJSON
4. Copy phần `geometry` và paste vào SQL

**Ví dụ:** Sau khi vẽ trên geojson.io, bạn sẽ thấy:

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

Copy phần `geometry` này:
```sql
INSERT INTO dia_diem (ten, geometry)
VALUES (
    'Điểm của tôi',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342, 21.0278]}')
);
```

### Cách 2: Dùng Google Maps

1. Click chuột phải trên Google Maps
2. Click vào tọa độ để copy (VD: `21.028511, 105.804817`)
3. Format lại thành GeoJSON: `[105.804817, 21.028511]` (đảo ngược: kinh độ trước)

### Cách 3: Dùng QGIS (Nếu có dữ liệu Shapefile)

1. Mở file `.shp` trong QGIS
2. Export layer → Save as → Format: **GeoJSON**
3. Mở file `.geojson` bằng Notepad, copy dữ liệu

## Ví Dụ Hoàn Chỉnh: Tạo Bản Đồ Các Quán Cafe

```sql
-- Bước 1: Tạo bảng
CREATE TABLE quan_cafe (
    id SERIAL PRIMARY KEY,
    ten_quan VARCHAR(255) NOT NULL,
    dia_chi TEXT,
    gia_trung_binh INTEGER,
    danh_gia DECIMAL(3,1),
    geometry GEOMETRY(Point, 4326)
);

-- Bước 2: Thêm dữ liệu
INSERT INTO quan_cafe (ten_quan, dia_chi, gia_trung_binh, danh_gia, geometry)
VALUES
    ('Highlands Coffee Tràng Tiền', '57 Tràng Tiền, HN', 50000, 4.2,
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0245]}')),

    ('The Coffee House Lý Thường Kiệt', '123 Lý Thường Kiệt, HN', 45000, 4.5,
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8445, 21.0189]}')),

    ('Starbucks Vincom', 'Vincom Center Bà Triệu, HN', 80000, 4.3,
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8492, 21.0167]}'));

-- Bước 3: Xem kết quả
SELECT ten_quan, dia_chi, gia_trung_binh, ST_AsText(geometry)
FROM quan_cafe
ORDER BY danh_gia DESC;
```

## Tips và Lưu Ý

### Format GeoJSON Đúng

✅ **Đúng:**
```json
{"type":"Point","coordinates":[105.8342, 21.0278]}
```

❌ **Sai:**
```json
{"type":"Point","coordinates":[21.0278, 105.8342]}  // Đảo ngược!
```

### SRID 4326

- Luôn dùng `SRID=4326` (WGS84) cho dữ liệu web
- Đây là hệ quy chiếu chuẩn của GPS

### Validate Geometry

```sql
-- Kiểm tra geometry có hợp lệ không
SELECT id, ten, ST_IsValid(geometry) as hop_le
FROM dia_diem;

-- Sửa geometry không hợp lệ
UPDATE dia_diem
SET geometry = ST_MakeValid(geometry)
WHERE NOT ST_IsValid(geometry);
```

### Tính Toán GIS

```sql
-- Tính khoảng cách giữa 2 điểm (mét)
SELECT ST_Distance(
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342, 21.0278]}')::geography,
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8500, 21.0300]}')::geography
);

-- Tìm điểm gần nhất
SELECT ten, ST_Distance(geometry::geography,
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8400, 21.0200]}')::geography
) as khoang_cach_met
FROM dia_diem
ORDER BY khoang_cach_met
LIMIT 5;

-- Tính diện tích polygon (m²)
SELECT ten_vung, ST_Area(geometry::geography) as dien_tich_m2
FROM ranh_gioi;
```

## Xử Lý Lỗi Thường Gặp

### Lỗi: "geometry must be a Point"

Nguyên nhân: Bạn insert Polygon vào bảng Point

Giải pháp: Kiểm tra lại định nghĩa bảng và geometry type

### Lỗi: "Invalid GeoJSON"

Nguyên nhân: Thiếu dấu `{}`, `[]` hoặc dấu phẩy

Giải pháp: Kiểm tra format JSON kỹ, dùng https://jsonlint.com/

### Lỗi: "SRID mismatch"

Nguyên nhân: Geometry có SRID khác 4326

Giải pháp:
```sql
-- Chuyển đổi SRID
UPDATE dia_diem
SET geometry = ST_Transform(geometry, 4326);
```

## Kết Luận

Bây giờ bạn đã có thể:

✅ Tạo bảng lưu dữ liệu GIS
✅ Thêm Point, LineString, Polygon vào database
✅ Kiểm tra và sửa dữ liệu
✅ Tính toán khoảng cách, diện tích
✅ Lấy tọa độ từ geojson.io hoặc Google Maps

Chúc bạn thành công!
