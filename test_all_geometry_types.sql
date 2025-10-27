-- ============================================
-- TEST CÁC LOẠI GEOMETRY
-- ============================================
-- File này chứa ví dụ cho cả 3 loại: Point, LineString, MultiPolygon
-- Bạn có thể chạy tất cả hoặc chỉ chạy từng phần

-- ============================================
-- 1. POINTS - Các điểm quan tâm
-- ============================================

-- Thêm trường học
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Trường THPT Chu Văn An', 'Trường học', 'Trường THPT nổi tiếng tại Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),

    ('Trường ĐH Bách Khoa', 'Trường học', 'Đại học Bách Khoa Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8436,21.0031]}')),

    ('Trường Tiểu học Kim Đồng', 'Trường học', 'Trường tiểu học công lập',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8256,21.0189]}'));

-- Thêm bệnh viện
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Bệnh viện Bạch Mai', 'Bệnh viện', 'Bệnh viện đa khoa hạng đặc biệt',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8436,21.0031]}')),

    ('Bệnh viện Việt Đức', 'Bệnh viện', 'Bệnh viện ngoại khoa',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0234]}'));

-- Thêm hồ nước
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Hồ Tây', 'Hồ nước', 'Hồ nước ngọt tự nhiên lớn nhất Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8234,21.0589]}')),

    ('Hồ Gươm', 'Hồ nước', 'Hồ Hoàn Kiếm - biểu tượng Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8527,21.0285]}'));

-- Thêm chợ
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Chợ Đồng Xuân', 'Chợ', 'Chợ truyền thống lớn nhất Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8490,21.0356]}')),

    ('Chợ Hôm', 'Chợ', 'Chợ truyền thống khu vực trung tâm',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8356,21.0189]}'));

-- ============================================
-- 2. LINESTRINGS - Tuyến đường
-- ============================================

-- Thêm tuyến bus
INSERT INTO routes (name, type, length_km, geometry)
VALUES
    ('Tuyến Bus 01: Bến Xe - Hoàn Kiếm', 'Bus', 8.5,
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8234,21.0589],
            [105.8356,21.0456],
            [105.8456,21.0334],
            [105.8527,21.0285]
        ]
     }')),

    ('Tuyến Bus 09: Long Biên - Đống Đa', 'Bus', 12.3,
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8590,21.0456],
            [105.8490,21.0356],
            [105.8390,21.0256],
            [105.8290,21.0156]
        ]
     }'));

-- Thêm tuyến metro
INSERT INTO routes (name, type, length_km, geometry)
VALUES
    ('Metro Line 2A: Cát Linh - Hà Đông', 'Metro', 13.1,
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8234,21.0234],
            [105.8134,21.0134],
            [105.8034,20.9934],
            [105.7934,20.9734]
        ]
     }'));

-- Thêm đường cao tốc
INSERT INTO routes (name, type, length_km, geometry)
VALUES
    ('Cao tốc Hà Nội - Hải Phòng', 'Highway', 105.5,
     ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8342,21.0278],
            [105.9456,21.0012],
            [106.0567,20.9845],
            [106.1678,20.9523],
            [106.2789,20.9234],
            [106.6845,20.8456]
        ]
     }'));

-- ============================================
-- 3. MULTIPOLYGONS - Ranh giới/Vùng
-- ============================================

-- Thêm quận
INSERT INTO boundaries (name, type, code, population, area_km2, geometry)
VALUES
    ('Quận Hoàn Kiếm', 'District', 'HK-001', 150000, 5.29,
     ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.8342,21.0378],
                [105.8542,21.0378],
                [105.8542,21.0178],
                [105.8342,21.0178],
                [105.8342,21.0378]
            ]
        ]]
     }')),

    ('Quận Ba Đình', 'District', 'BD-001', 230000, 9.21,
     ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.8100,21.0400],
                [105.8350,21.0400],
                [105.8350,21.0200],
                [105.8100,21.0200],
                [105.8100,21.0400]
            ]
        ]]
     }'));

-- Thêm tỉnh
INSERT INTO boundaries (name, type, code, population, area_km2, geometry)
VALUES
    ('Tỉnh Hà Nam', 'Province', 'HN', 850000, 860.5,
     ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.9000,20.5500],
                [106.1000,20.5500],
                [106.1000,20.3500],
                [105.9000,20.3500],
                [105.9000,20.5500]
            ]
        ]]
     }')),

    ('Tỉnh Ninh Bình', 'Province', 'NB', 950000, 1392.4,
     ST_GeomFromGeoJSON('{
        "type":"MultiPolygon",
        "coordinates":[[
            [
                [105.8000,20.2500],
                [106.0000,20.2500],
                [106.0000,20.1000],
                [105.8000,20.1000],
                [105.8000,20.2500]
            ]
        ]]
     }'));

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

-- Xem tất cả điểm quan tâm
SELECT
    id,
    name,
    category,
    ST_X(geometry) as kinh_do,
    ST_Y(geometry) as vi_do
FROM points_of_interest
ORDER BY category, id;

-- Xem tất cả tuyến đường
SELECT
    id,
    name,
    type,
    length_km,
    ST_AsText(geometry) as duong_di
FROM routes
ORDER BY type, id;

-- Xem tất cả ranh giới
SELECT
    id,
    name,
    type,
    population,
    area_km2,
    ST_AsText(geometry) as ranh_gioi
FROM boundaries
ORDER BY type, id;

-- Đếm số lượng
SELECT
    'Points' as layer_type,
    COUNT(*) as total
FROM points_of_interest
UNION ALL
SELECT
    'Routes' as layer_type,
    COUNT(*) as total
FROM routes
UNION ALL
SELECT
    'Boundaries' as layer_type,
    COUNT(*) as total
FROM boundaries;

-- ============================================
-- TEST API
-- ============================================
-- Sau khi chạy SQL này, test các API endpoints:
--
-- Layer 1 (Points):     http://localhost:8080/api/v1/layers/1/features/
-- Layer 2 (Boundaries): http://localhost:8080/api/v1/layers/2/features/
-- Layer 3 (Routes):     http://localhost:8080/api/v1/layers/3/features/
--
-- Hoặc dùng curl:
-- curl http://localhost:8080/api/v1/layers/1/features/
-- ============================================
