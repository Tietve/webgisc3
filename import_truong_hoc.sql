-- ============================================
-- Script Import Điểm Trường Học Vào Database
-- ============================================

-- Bước 1: Thêm điểm trường học vào bảng points_of_interest
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Trường Học Test',                    -- Tên trường (bạn có thể đổi)
    'Trường học',                         -- Loại địa điểm
    'Điểm test từ geojson.io',           -- Mô tả
    ST_GeomFromGeoJSON('{
        "type": "Point",
        "coordinates": [105.80843921564815, 20.99561834482023]
    }')
);

-- Bước 2: Xem kết quả vừa thêm
SELECT
    id,
    name,
    category,
    description,
    ST_AsText(geometry) as toa_do,
    ST_X(geometry) as kinh_do,
    ST_Y(geometry) as vi_do,
    created_at
FROM points_of_interest
WHERE category = 'Trường học'
ORDER BY id DESC
LIMIT 5;

-- Bước 3: Xem tất cả điểm đã có trong database
SELECT
    id,
    name,
    category,
    ST_AsText(geometry) as toa_do
FROM points_of_interest
ORDER BY id;

-- ============================================
-- LƯU Ý:
-- - Bạn có thể đổi tên 'Trường Học Test' thành tên thật
-- - Category 'Trường học' sẽ dùng để phân loại và hiển thị icon
-- - Tọa độ: [105.808, 20.996] là khu vực gần Hà Nội
-- ============================================
