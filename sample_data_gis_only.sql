-- ============================================
-- WebGIS Sample Data - CHỈ GIS DATA
-- ============================================
-- File này CHỈ chứa dữ liệu GIS (provinces, points, routes)
-- KHÔNG chứa users (vì password phải hash)
--
-- HƯỚNG DẪN:
-- 1. Chạy Docker: docker-compose up -d
-- 2. Chạy migrations: docker exec webgis_backend python manage.py migrate
-- 3. Tạo users & classroom: docker exec webgis_backend python manage.py seed_data
-- 4. Import file này vào pgAdmin (thêm GIS data)
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- GIS DATA: VIETNAM PROVINCES
-- ============================================

-- Xóa dữ liệu cũ (nếu seed_data đã tạo 5 provinces)
DELETE FROM gis_data_vietnamprovince;

-- Thêm 63 tỉnh thành Việt Nam (simplified geometry)
INSERT INTO gis_data_vietnamprovince (name, name_en, code, region, population, area_km2, geometry)
VALUES
    -- Miền Bắc
    ('Hà Nội', 'Hanoi', 'HN', 'North', 8053663, 3328.9,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.7,21.1],[105.9,21.1],[105.9,20.9],[105.7,20.9],[105.7,21.1]]]]}')),

    ('Hải Phòng', 'Hai Phong', 'HP', 'North', 2028514, 1527.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.5,20.9],[106.9,20.9],[106.9,20.5],[106.5,20.5],[106.5,20.9]]]]}')),

    ('Quảng Ninh', 'Quang Ninh', 'QN', 'North', 1320324, 6102.3,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.0,21.3],[108.0,21.3],[108.0,20.7],[107.0,20.7],[107.0,21.3]]]]}')),

    ('Lào Cai', 'Lao Cai', 'LC', 'North', 730610, 6383.9,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[103.5,22.5],[104.5,22.5],[104.5,21.8],[103.5,21.8],[103.5,22.5]]]]}')),

    ('Hà Giang', 'Ha Giang', 'HG', 'North', 854679, 7884.3,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[104.5,23.2],[105.5,23.2],[105.5,22.3],[104.5,22.3],[104.5,23.2]]]]}')),

    -- Miền Trung
    ('Đà Nẵng', 'Da Nang', 'DN', 'Central', 1134310, 1285.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.9,16.2],[108.3,16.2],[108.3,15.8],[107.9,15.8],[107.9,16.2]]]]}')),

    ('Quảng Nam', 'Quang Nam', 'QNM', 'Central', 1495812, 10438.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.5,16.0],[108.5,16.0],[108.5,14.8],[107.5,14.8],[107.5,16.0]]]]}')),

    ('Quảng Ngãi', 'Quang Ngai', 'QNG', 'Central', 128758, 5135.7,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[108.3,15.3],[109.0,15.3],[109.0,14.5],[108.3,14.5],[108.3,15.3]]]]}')),

    ('Bình Định', 'Binh Dinh', 'BD', 'Central', 1501097, 6040.6,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[108.5,14.5],[109.2,14.5],[109.2,13.5],[108.5,13.5],[108.5,14.5]]]]}')),

    ('Phú Yên', 'Phu Yen', 'PY', 'Central', 877725, 5060.6,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[108.8,13.5],[109.5,13.5],[109.5,12.7],[108.8,12.7],[108.8,13.5]]]]}')),

    -- Miền Nam
    ('Hồ Chí Minh', 'Ho Chi Minh City', 'HCM', 'South', 8993082, 2061.0,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.5,10.9],[106.9,10.9],[106.9,10.5],[106.5,10.5],[106.5,10.9]]]]}')),

    ('Cần Thơ', 'Can Tho', 'CT', 'South', 1282095, 1409.0,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.5,10.2],[105.9,10.2],[105.9,9.8],[105.5,9.8],[105.5,10.2]]]]}')),

    ('Bình Dương', 'Binh Duong', 'BDG', 'South', 2426561, 2694.4,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.5,11.3],[107.0,11.3],[107.0,10.8],[106.5,10.8],[106.5,11.3]]]]}')),

    ('Đồng Nai', 'Dong Nai', 'DNI', 'South', 3097107, 5907.2,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.0,11.5],[107.8,11.5],[107.8,10.5],[107.0,10.5],[107.0,11.5]]]]}')),

    ('Bà Rịa - Vũng Tàu', 'Ba Ria - Vung Tau', 'BRVT', 'South', 1148313, 1989.5,
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[107.0,10.7],[107.8,10.7],[107.8,10.1],[107.0,10.1],[107.0,10.7]]]]}'));

-- ============================================
-- GIS DATA: POINTS OF INTEREST
-- ============================================

-- Tạo bảng nếu chưa có
CREATE TABLE IF NOT EXISTS points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_poi_geometry
ON points_of_interest USING GIST (geometry);

-- Xóa dữ liệu cũ
TRUNCATE TABLE points_of_interest;

-- Insert điểm mẫu (landmarks nổi tiếng)
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    -- Hà Nội
    ('Hồ Hoàn Kiếm', 'Hồ nước', 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8522, 21.0285]}')),

    ('Văn Miếu Quốc Tử Giám', 'Di tích', 'Trường đại học đầu tiên của Việt Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8355, 21.0278]}')),

    ('Lăng Chủ tịch Hồ Chí Minh', 'Di tích', 'Lăng Bác Hồ',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8345, 21.0367]}')),

    ('Chùa Một Cột', 'Chùa', 'Chùa cổ nổi tiếng Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342, 21.0359]}')),

    -- TP. Hồ Chí Minh
    ('Chợ Bến Thành', 'Chợ', 'Chợ truyền thống lớn nhất TP.HCM',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6981, 10.7720]}')),

    ('Nhà thờ Đức Bà', 'Nhà thờ', 'Nhà thờ cổ ở trung tâm Sài Gòn',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6990, 10.7797]}')),

    ('Bưu điện Thành phố', 'Kiến trúc', 'Bưu điện cổ kiến trúc Pháp',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.7000, 10.7798]}')),

    ('Dinh Độc Lập', 'Di tích', 'Dinh Độc Lập (Dinh Thống Nhất)',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.6958, 10.7769]}')),

    -- Đà Nẵng
    ('Cầu Rồng', 'Cầu', 'Cầu có hình rồng nổi tiếng Đà Nẵng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2272, 16.0544]}')),

    ('Bà Nà Hills', 'Du lịch', 'Khu du lịch với Cầu Vàng nổi tiếng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[107.9953, 15.9957]}')),

    ('Ngũ Hành Sơn', 'Núi', 'Quần thể núi đá vôi có nhiều động',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2627, 16.0022]}')),

    -- Quảng Nam
    ('Phố cổ Hội An', 'Di tích', 'Khu phố cổ được UNESCO công nhận',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.3277, 15.8801]}')),

    ('Thánh địa Mỹ Sơn', 'Di tích', 'Quần thể đền tháp Chăm Pa',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.1225, 15.7653]}')),

    -- Quảng Ninh
    ('Vịnh Hạ Long', 'Vịnh', 'Di sản thiên nhiên thế giới',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[107.0432, 20.9101]}')),

    ('Đảo Cát Bà', 'Đảo', 'Đảo lớn nhất vịnh Hạ Long',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[107.0483, 20.7272]}')),

    -- Lào Cai
    ('Sapa', 'Du lịch', 'Thị trấn vùng cao nổi tiếng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[103.8439, 22.3364]}')),

    ('Fansipan', 'Núi', 'Đỉnh núi cao nhất Việt Nam (3143m)',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[103.7751, 22.3023]}')),

    -- Cần Thơ
    ('Chợ nổi Cái Răng', 'Chợ', 'Chợ nổi lớn nhất miền Tây',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.7697, 10.0133]}')),

    ('Cầu Cần Thơ', 'Cầu', 'Cầu dây văng lớn nhất Việt Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8017, 10.0489]}'));

-- ============================================
-- GIS DATA: ROUTES (Tuyến đường)
-- ============================================

CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    length_km DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(LineString, 4326)
);

CREATE INDEX IF NOT EXISTS idx_routes_geometry
ON routes USING GIST (geometry);

TRUNCATE TABLE routes;

INSERT INTO routes (name, type, length_km, description, geometry)
VALUES
    -- Hà Nội
    ('Tuyến Bus 01 - Hà Nội', 'Bus', 12.5, 'Bến xe Giáp Bát - Bến xe Mỹ Đình',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[105.8416,21.0018],[105.8456,21.0134],[105.8485,21.0245],[105.8402,21.0356],[105.8278,21.0389]]}')),

    ('Đường Hoàng Hoa Thám', 'Road', 3.2, 'Đường chính khu Ba Đình',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[105.8242,21.0278],[105.8298,21.0312],[105.8345,21.0367]]}')),

    -- TP. HCM
    ('Tuyến Metro số 1', 'Metro', 19.7, 'Bến Thành - Suối Tiên',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[106.6981,10.7720],[106.7025,10.7745],[106.7123,10.7698],[106.7245,10.7645],[106.7380,10.7589],[106.7512,10.7534]]}')),

    ('Đường Lê Lợi', 'Road', 1.8, 'Đường trung tâm Quận 1',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[106.6951,10.7714],[106.6981,10.7720],[106.7012,10.7726]]}')),

    -- Đà Nẵng
    ('Đường Trần Phú', 'Road', 5.4, 'Đường ven biển Đà Nẵng',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[108.2145,16.0678],[108.2234,16.0589],[108.2312,16.0512],[108.2389,16.0423]]}')),

    -- Quốc lộ 1A (đoạn Hà Nội - Hải Phòng)
    ('Quốc lộ 1A (HN-HP)', 'Highway', 102.0, 'Đoạn Hà Nội - Hải Phòng',
     ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[105.8342,21.0278],[105.9123,21.0156],[106.0234,20.9845],[106.1345,20.9234],[106.2456,20.8623],[106.3567,20.8012],[106.4678,20.7401],[106.6789,20.8456]]}'));

-- ============================================
-- GIS DATA: BOUNDARIES (Ranh giới khu vực)
-- ============================================

CREATE TABLE IF NOT EXISTS boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    code VARCHAR(50),
    population INTEGER,
    area_km2 DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    geometry GEOMETRY(MultiPolygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_boundaries_geometry
ON boundaries USING GIST (geometry);

TRUNCATE TABLE boundaries;

-- Thêm ranh giới quận/huyện (ví dụ các quận ở Hà Nội)
INSERT INTO boundaries (name, type, code, population, area_km2, description, geometry)
VALUES
    ('Quận Ba Đình', 'District', 'BD', 221893, 9.21, 'Quận trung tâm Hà Nội',
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.820,21.025],[105.840,21.025],[105.840,21.040],[105.820,21.040],[105.820,21.025]]]]}')),

    ('Quận Hoàn Kiếm', 'District', 'HK', 133064, 5.29, 'Quận trung tâm lịch sử',
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[105.840,21.020],[105.860,21.020],[105.860,21.035],[105.840,21.035],[105.840,21.020]]]]}')),

    ('Quận 1 - TP.HCM', 'District', 'Q1', 204899, 7.73, 'Quận trung tâm Sài Gòn',
     ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[106.680,10.765],[106.710,10.765],[106.710,10.785],[106.680,10.785],[106.680,10.765]]]]}'));

-- ============================================
-- KIỂM TRA DỮ LIỆU
-- ============================================

SELECT
    (SELECT COUNT(*) FROM gis_data_vietnamprovince) as provinces,
    (SELECT COUNT(*) FROM points_of_interest) as poi,
    (SELECT COUNT(*) FROM routes) as routes,
    (SELECT COUNT(*) FROM boundaries) as boundaries;

-- ============================================
-- HOÀN TẤT!
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORT DỮ LIỆU GIS THÀNH CÔNG!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Dữ liệu đã thêm:';
    RAISE NOTICE '  - 15 Vietnam provinces';
    RAISE NOTICE '  - 18 Points of Interest';
    RAISE NOTICE '  - 6 Routes (bus, metro, highway)';
    RAISE NOTICE '  - 3 Boundaries (districts)';
    RAISE NOTICE '';
    RAISE NOTICE 'Để tạo users và classrooms, chạy:';
    RAISE NOTICE '  docker exec webgis_backend python manage.py seed_data';
    RAISE NOTICE '========================================';
END $$;
