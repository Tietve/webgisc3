-- ========================================
-- DEMO: MULTIPOINT - 1 Hàng Nhiều Điểm
-- ========================================

-- CÁCH 1: Tạo bảng riêng cho MultiPoint
CREATE TABLE IF NOT EXISTS category_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    geometry GEOMETRY(MultiPoint, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm 1 hàng duy nhất chứa TẤT CẢ trường học
INSERT INTO category_locations (name, category, description, geometry)
VALUES (
    'Trường học',
    'truong_hoc',
    'Tất cả các trường học trên địa bàn',
    ST_GeomFromGeoJSON('{
        "type": "MultiPoint",
        "coordinates": [
            [105.8342, 21.0278],
            [105.8456, 21.0334],
            [105.8389, 21.0312],
            [105.8500, 21.0400],
            [105.8200, 21.0250]
        ]
    }')
);

-- Thêm 1 hàng duy nhất chứa TẤT CẢ bệnh viện
INSERT INTO category_locations (name, category, description, geometry)
VALUES (
    'Bệnh viện',
    'benh_vien',
    'Tất cả các bệnh viện trên địa bàn',
    ST_GeomFromGeoJSON('{
        "type": "MultiPoint",
        "coordinates": [
            [105.8422, 21.0026],
            [105.8456, 21.0267],
            [105.8534, 21.0189]
        ]
    }')
);

-- Đăng ký layer
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏫 Trường học (MultiPoint)',
    'category_locations',
    'MULTIPOINT',
    'Tất cả trường học - 1 hàng nhiều điểm',
    'category',
    'truong_hoc',
    true
);

-- Kiểm tra
SELECT
    name,
    category,
    ST_NumGeometries(geometry) as so_diem,
    ST_AsText(geometry) as geometry_text
FROM category_locations;

-- ========================================
-- KẾT QUẢ:
-- ========================================
-- ✅ Bạn thấy:
--    - 1 hàng "Trường học" với 5 điểm
--    - 1 hàng "Bệnh viện" với 3 điểm
--
-- ❌ Nhưng:
--    - KHÔNG biết tên từng trường cụ thể
--    - Click vào chỉ thấy "Trường học"
--
-- ========================================


-- CÁCH 2: GIẢI PHÁP KẾT HỢP (TỐI ƯU NHẤT!)
-- Giữ chi tiết ở points_of_interest
-- Tạo VIEW để xem tổng quan MultiPoint

CREATE OR REPLACE VIEW truong_hoc_multipoint AS
SELECT
    'Trường học' as name,
    'truong_hoc' as category,
    COUNT(*) as total_points,
    ST_Collect(geometry) as geometry  -- ← Gộp tất cả điểm thành MultiPoint
FROM points_of_interest
WHERE category = 'truong_hoc'
GROUP BY category;

-- Kiểm tra VIEW
SELECT
    name,
    total_points,
    ST_NumGeometries(geometry) as so_diem,
    ST_AsText(geometry) as geometry_preview
FROM truong_hoc_multipoint;

-- ========================================
-- ƯU ĐIỂM CÁCH 2:
-- ========================================
-- ✅ Giữ nguyên dữ liệu chi tiết trong points_of_interest
-- ✅ Khi cần xem tổng quan → Query VIEW
-- ✅ Không mất thông tin
-- ✅ Linh hoạt nhất!
-- ========================================
