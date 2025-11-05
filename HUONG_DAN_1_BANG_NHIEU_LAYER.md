# 📍 Hướng Dẫn: 1 Bảng Chung Cho Nhiều Layer

## 🎯 Vấn Đề

**Câu hỏi:** Nếu mỗi loại điểm (trường học, bệnh viện, chợ...) tạo 1 bảng riêng thì sẽ có quá nhiều bảng. Có cách nào dùng **1 BẢNG CHUNG** không?

**Trả lời:** ✅ **CÓ!** Dùng cột `category` để phân loại.

---

## ✅ Giải Pháp: Dùng Bảng `points_of_interest`

### Bảng Đã Có Sẵn

```sql
-- Bảng này ĐÃ TỒN TẠI trong hệ thống
points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),        -- ← Phân loại: school, hospital, market...
    description TEXT,
    geometry GEOMETRY(Point, 4326)
)
```

### Lợi Ích

✅ **Chỉ 1 bảng** thay vì 10+ bảng
✅ **Dễ quản lý** - Tất cả điểm ở 1 chỗ
✅ **Dễ thêm loại mới** - Chỉ cần thêm category mới
✅ **Dễ query** - `WHERE category = 'school'`

---

## 📝 Ví Dụ: Thêm Nhiều Loại Điểm

```sql
-- Thêm TẤT CẢ loại điểm vào 1 bảng
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    -- 🏫 Trường học
    ('THPT Trần Phú', 'school', 'Trường THPT',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('THCS Nguyễn Du', 'school', 'Trường THCS',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0334]}')),
    ('Tiểu học Kim Đồng', 'school', 'Trường tiểu học',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8389,21.0312]}')),

    -- 🏥 Bệnh viện
    ('Bệnh viện Bạch Mai', 'hospital', 'BV đa khoa',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8422,21.0026]}')),
    ('Bệnh viện Việt Đức', 'hospital', 'BV đa khoa',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0267]}')),

    -- 🏪 Chợ
    ('Chợ Đồng Xuân', 'market', 'Chợ truyền thống',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8489,21.0359]}')),
    ('Chợ Hôm', 'market', 'Chợ truyền thống',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8345,21.0189]}')),

    -- 🏞️ Công viên
    ('Công viên Thống Nhất', 'park', 'Công viên lớn',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8389,21.0189]}')),
    ('Công viên Thủ Lệ', 'park', 'Vườn thú',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8267,21.0389]}')),

    -- 🏦 Ngân hàng
    ('Vietcombank', 'bank', 'Ngân hàng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0312]}')),

    -- 🍽️ Nhà hàng
    ('Nhà hàng Ngon', 'restaurant', 'Ẩm thực VN',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8534,21.0289]}')),

    -- ☕ Quán cà phê
    ('Highlands Coffee', 'cafe', 'Cà phê',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0278]}')),

    -- ⛽ Trạm xăng
    ('Petrolimex Giảng Võ', 'gas_station', 'Trạm xăng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8234,21.0334]}'));
```

**Kết quả:** 12 loại điểm khác nhau trong **1 BẢNG!** 🎉

---

## 🗂️ Cách Tạo Layer Cho Từng Loại

### ⚠️ VẤN ĐỀ: Backend Chưa Hỗ Trợ Filter

Hiện tại backend **CHƯA HỖ TRỢ** filter theo category. Có 3 giải pháp:

---

## 💡 GIẢI PHÁP 1: Tạo View Cho Từng Loại (ĐƠN GIẢN NHẤT!)

**Ý tưởng:** Tạo VIEW (bảng ảo) cho từng category.

### Bước 1: Tạo Views

```sql
-- View cho trường học
CREATE VIEW schools AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'school';

-- View cho bệnh viện
CREATE VIEW hospitals AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'hospital';

-- View cho chợ
CREATE VIEW markets AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'market';

-- View cho công viên
CREATE VIEW parks AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'park';

-- View cho ngân hàng
CREATE VIEW banks AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'bank';

-- View cho nhà hàng
CREATE VIEW restaurants AS
SELECT id, name, category, description, geometry
FROM points_of_interest
WHERE category = 'restaurant';
```

### Bước 2: Đăng Ký Layers

```sql
-- Đăng ký từng view như 1 layer
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Trường học', 'schools', 'POINT', 'Các trường học trên địa bàn', true),
    ('Bệnh viện', 'hospitals', 'POINT', 'Các bệnh viện và phòng khám', true),
    ('Chợ', 'markets', 'POINT', 'Các chợ truyền thống', true),
    ('Công viên', 'parks', 'POINT', 'Công viên và khu vui chơi', true),
    ('Ngân hàng', 'banks', 'POINT', 'Các ngân hàng và ATM', true),
    ('Nhà hàng', 'restaurants', 'POINT', 'Nhà hàng và quán ăn', true);
```

### ✅ Ưu Điểm Giải Pháp Này

- ✅ **KHÔNG CẦN sửa code backend**
- ✅ View tự động cập nhật khi thêm/xóa dữ liệu
- ✅ Frontend không biết khác biệt giữa view và table
- ✅ Đơn giản, dễ hiểu

### ❌ Nhược Điểm

- Vẫn phải tạo nhiều views (nhưng nhẹ hơn nhiều so với tables)
- Mỗi layer mới cần tạo view mới

---

## 💡 GIẢI PHÁP 2: Dùng 1 Layer "Điểm Quan Tâm"

**Ý tưởng:** Chỉ có 1 layer hiển thị TẤT CẢ điểm, dùng styling để phân biệt.

### Đăng Ký Layer

```sql
-- 1 layer duy nhất
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('Điểm quan tâm', 'points_of_interest', 'POINT', 'Tất cả các điểm quan tâm', true);
```

### Styling Theo Category (Frontend)

Sửa file `frontend/src/pages/MapViewer.jsx`:

```javascript
const getLayerStyle = (feature) => {
    const category = feature.properties.category;

    // Màu theo category
    const colorMap = {
        'school': '#e74c3c',      // Đỏ - Trường học
        'hospital': '#9b59b6',    // Tím - Bệnh viện
        'market': '#f39c12',      // Cam - Chợ
        'park': '#2ecc71',        // Xanh lá - Công viên
        'bank': '#3498db',        // Xanh dương - Ngân hàng
        'restaurant': '#e67e22',  // Cam đậm - Nhà hàng
        'cafe': '#95a5a6',        // Xám - Quán cà phê
        'gas_station': '#34495e', // Đen - Trạm xăng
    };

    const color = colorMap[category] || '#95a5a6';

    return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: color,
        fillOpacity: 0.7,
        radius: 8  // Kích thước điểm
    };
};
```

### ✅ Ưu Điểm

- ✅ Đơn giản nhất - chỉ 1 layer
- ✅ Hiển thị tất cả điểm cùng lúc
- ✅ Màu sắc phân biệt category

### ❌ Nhược Điểm

- User không thể bật/tắt từng loại riêng
- Nhiều điểm sẽ làm map rối

---

## 💡 GIẢI PHÁP 3: Sửa Backend Để Hỗ Trợ Filter

**Ý tưởng:** Thêm cột `filter_column` và `filter_value` vào `gis_data_maplayer`.

### Bước 1: Thêm Cột Vào MapLayer

```sql
ALTER TABLE gis_data_maplayer
ADD COLUMN filter_column VARCHAR(100),
ADD COLUMN filter_value VARCHAR(100);
```

### Bước 2: Đăng Ký Layers Với Filter

```sql
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, filter_column, filter_value, is_active)
VALUES
    ('Trường học', 'points_of_interest', 'POINT', 'category', 'school', true),
    ('Bệnh viện', 'points_of_interest', 'POINT', 'category', 'hospital', true),
    ('Chợ', 'points_of_interest', 'POINT', 'category', 'market', true);
```

### Bước 3: Sửa Backend

Sửa file `apps/gis_data/views.py`:

```python
# Dòng 102-105, thêm filter
query = f"""
    SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
            json_build_object(
                'type', 'Feature',
                'id', id,
                'properties', json_build_object(
                    'id', id,
                    'name', name,
                    'category', COALESCE(category, 'Unknown')
                ),
                'geometry', ST_AsGeoJSON(geometry)::json
            )
        ), '[]'::json)
    ) as geojson
    FROM {table_name}
    WHERE geometry IS NOT NULL
    {self._get_filter_clause(layer)}  -- ← THÊM DÒNG NÀY
"""

# Thêm method mới
def _get_filter_clause(self, layer):
    if layer.filter_column and layer.filter_value:
        return f"AND {layer.filter_column} = '{layer.filter_value}'"
    return ""
```

### ✅ Ưu Điểm

- ✅ Linh hoạt nhất
- ✅ User bật/tắt từng loại riêng
- ✅ Có thể filter theo nhiều cột khác nhau

### ❌ Nhược Điểm

- Phải sửa code backend
- Phải migrate database

---

## 🏆 KHUYẾN NGHỊ: Dùng Giải Pháp 1 (Views)

**Lý do:**
- ✅ Đơn giản nhất, không cần sửa code
- ✅ Views tự động cập nhật
- ✅ User bật/tắt từng loại riêng

### Script Hoàn Chỉnh

```sql
-- ==========================================
-- GIẢI PHÁP HOÀN CHỈNH: VIEWS
-- ==========================================

-- Bước 1: Thêm dữ liệu vào bảng chung
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('THPT Trần Phú', 'school', 'Trường THPT', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('THCS Nguyễn Du', 'school', 'Trường THCS', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0334]}')),
    ('Bệnh viện Bạch Mai', 'hospital', 'BV đa khoa', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8422,21.0026]}')),
    ('Chợ Đồng Xuân', 'market', 'Chợ truyền thống', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8489,21.0359]}')),
    ('Công viên Thống Nhất', 'park', 'Công viên lớn', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8389,21.0189]}'));

-- Bước 2: Tạo views cho từng category
CREATE OR REPLACE VIEW schools AS
SELECT * FROM points_of_interest WHERE category = 'school';

CREATE OR REPLACE VIEW hospitals AS
SELECT * FROM points_of_interest WHERE category = 'hospital';

CREATE OR REPLACE VIEW markets AS
SELECT * FROM points_of_interest WHERE category = 'market';

CREATE OR REPLACE VIEW parks AS
SELECT * FROM points_of_interest WHERE category = 'park';

-- Bước 3: Đăng ký layers
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type, description, is_active)
VALUES
    ('🏫 Trường học', 'schools', 'POINT', 'Các trường học', true),
    ('🏥 Bệnh viện', 'hospitals', 'POINT', 'Các bệnh viện', true),
    ('🏪 Chợ', 'markets', 'POINT', 'Các chợ', true),
    ('🏞️ Công viên', 'parks', 'POINT', 'Công viên', true);

-- ==========================================
-- KIỂM TRA
-- ==========================================

-- Kiểm tra dữ liệu
SELECT category, COUNT(*) FROM points_of_interest GROUP BY category;

-- Kiểm tra views
SELECT * FROM schools;
SELECT * FROM hospitals;

-- Kiểm tra layers
SELECT name, data_source_table FROM gis_data_maplayer WHERE is_active = true;
```

---

## 🎨 Styling Cho Từng Category

### Thêm Icon/Màu Cho Từng Loại

Sửa frontend `frontend/src/pages/MapViewer.jsx`:

```javascript
const getLayerStyle = (feature) => {
    const category = feature.properties.category;

    // Màu và style cho từng category
    const styles = {
        'school': {
            fillColor: '#e74c3c',
            color: '#c0392b',
            icon: '🏫'
        },
        'hospital': {
            fillColor: '#9b59b6',
            color: '#8e44ad',
            icon: '🏥'
        },
        'market': {
            fillColor: '#f39c12',
            color: '#d68910',
            icon: '🏪'
        },
        'park': {
            fillColor: '#2ecc71',
            color: '#27ae60',
            icon: '🏞️'
        },
    };

    const style = styles[category] || { fillColor: '#95a5a6', color: '#7f8c8d' };

    return {
        fillColor: style.fillColor,
        weight: 2,
        opacity: 1,
        color: style.color,
        fillOpacity: 0.7,
        radius: 10
    };
};
```

---

## 🧪 Kiểm Tra

### Trong pgAdmin

```sql
-- Kiểm tra số lượng theo category
SELECT category, COUNT(*) as total
FROM points_of_interest
GROUP BY category
ORDER BY total DESC;

-- Kiểm tra views
SELECT * FROM schools;
SELECT COUNT(*) FROM hospitals;

-- Kiểm tra layers
SELECT * FROM gis_data_maplayer WHERE data_source_table IN ('schools', 'hospitals', 'markets');
```

### Trên Web

1. Refresh trang: **http://localhost:3000**
2. Click 🗺️ Layers
3. Thấy checkboxes:
   - ☐ 🏫 Trường học
   - ☐ 🏥 Bệnh viện
   - ☐ 🏪 Chợ
   - ☐ 🏞️ Công viên
4. Tick từng checkbox → Xem layer riêng!

---

## 📊 So Sánh 3 Giải Pháp

| | Giải Pháp 1: Views | Giải Pháp 2: 1 Layer | Giải Pháp 3: Filter |
|---|---|---|---|
| **Sửa code backend?** | ❌ Không | ❌ Không | ✅ Có |
| **Bật/tắt riêng?** | ✅ Có | ❌ Không | ✅ Có |
| **Độ phức tạp** | 🟢 Đơn giản | 🟢 Rất đơn giản | 🔴 Phức tạp |
| **Linh hoạt** | 🟡 Trung bình | 🔴 Thấp | 🟢 Cao nhất |
| **Khuyến nghị** | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## 💡 Best Practice

### Khi Nào Dùng Gì?

**Dùng Views (Giải pháp 1):**
- ✅ Khi bạn muốn đơn giản, không sửa code
- ✅ Khi số lượng category ít (< 10)
- ✅ Khi cần user bật/tắt riêng

**Dùng 1 Layer (Giải pháp 2):**
- ✅ Khi bạn muốn hiển thị tất cả cùng lúc
- ✅ Khi chỉ cần phân biệt bằng màu sắc
- ✅ Demo nhanh, prototype

**Dùng Filter (Giải pháp 3):**
- ✅ Khi bạn cần linh hoạt cao
- ✅ Khi có nhiều cột filter khác nhau
- ✅ Khi dự án lớn, phức tạp

---

## 🎯 Tóm Tắt

### Câu Trả Lời Ngắn Gọn

**Câu hỏi:** Có cần tạo bảng riêng cho mỗi loại không?

**Trả lời:** ❌ **KHÔNG!** Dùng 1 bảng `points_of_interest` với cột `category`.

### 3 Bước Đơn Giản

```sql
-- 1. Thêm dữ liệu vào bảng chung
INSERT INTO points_of_interest (name, category, geometry) VALUES (...);

-- 2. Tạo view cho từng category
CREATE VIEW schools AS SELECT * FROM points_of_interest WHERE category = 'school';

-- 3. Đăng ký layer
INSERT INTO gis_data_maplayer (name, data_source_table, geom_type)
VALUES ('Trường học', 'schools', 'POINT');
```

**✅ XONG! Refresh web → Tick checkbox → Xem layer!**

---

**Bây giờ bạn có thể thêm hàng trăm loại điểm vào 1 bảng duy nhất! 🎉**
