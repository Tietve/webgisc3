-- ========================================
-- SCRIPT TEST: LAYER FILTERING
-- Hướng dẫn: Copy toàn bộ script này vào pgAdmin và chạy
-- ========================================

-- BƯỚC 1: Thêm dữ liệu mẫu vào points_of_interest
-- ========================================

INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    -- 🏫 Trường học
    ('THPT Trần Phú', 'truong_hoc', 'Trường trung học phổ thông',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('THCS Nguyễn Du', 'truong_hoc', 'Trường trung học cơ sở',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0334]}')),
    ('Tiểu học Kim Đồng', 'truong_hoc', 'Trường tiểu học',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8389,21.0312]}')),
    ('Mầm non Hoa Hồng', 'truong_hoc', 'Trường mầm non',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8500,21.0400]}')),

    -- 🏥 Bệnh viện
    ('Bệnh viện Bạch Mai', 'benh_vien', 'Bệnh viện đa khoa lớn nhất Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8422,21.0026]}')),
    ('Bệnh viện Việt Đức', 'benh_vien', 'Bệnh viện đa khoa hạng đặc biệt',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0267]}')),
    ('Bệnh viện E', 'benh_vien', 'Bệnh viện trung ương',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8534,21.0189]}')),

    -- 🏪 Chợ
    ('Chợ Đồng Xuân', 'cho', 'Chợ truyền thống lớn nhất Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8489,21.0359]}')),
    ('Chợ Hôm', 'cho', 'Chợ truyền thống',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8345,21.0189]}')),
    ('Chợ 19-12', 'cho', 'Chợ đầu mối',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8267,21.0445]}')),

    -- 🏞️ Công viên
    ('Công viên Thống Nhất', 'cong_vien', 'Công viên lớn ở trung tâm Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8389,21.0189]}')),
    ('Công viên Thủ Lệ', 'cong_vien', 'Vườn thú Hà Nội',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8267,21.0389]}')),

    -- ☕ Quán cà phê
    ('Highlands Coffee Hoàn Kiếm', 'cafe', 'Chuỗi cà phê Việt Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0289]}')),
    ('Trung Nguyên Legend', 'cafe', 'Cà phê đặc sản Việt',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0278]}')),

    -- 🏦 Ngân hàng
    ('Vietcombank Hàng Bài', 'ngan_hang', 'Ngân hàng thương mại',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0312]}')),
    ('BIDV Hoàn Kiếm', 'ngan_hang', 'Ngân hàng đầu tư và phát triển',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8523,21.0301]}'));

-- Kiểm tra dữ liệu đã thêm
SELECT category, COUNT(*) as total
FROM points_of_interest
GROUP BY category
ORDER BY total DESC;


-- BƯỚC 2: Đăng ký các layer MỚI với filter
-- ========================================

-- Layer cho TRƯỜNG HỌC (chỉ hiển thị category='truong_hoc')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏫 Trường học',
    'points_of_interest',
    'POINT',
    'Các trường học trên địa bàn Hà Nội',
    'category',
    'truong_hoc',
    true
);

-- Layer cho BỆNH VIỆN (chỉ hiển thị category='benh_vien')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏥 Bệnh viện',
    'points_of_interest',
    'POINT',
    'Các bệnh viện và cơ sở y tế',
    'category',
    'benh_vien',
    true
);

-- Layer cho CHỢ (chỉ hiển thị category='cho')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏪 Chợ',
    'points_of_interest',
    'POINT',
    'Các chợ truyền thống',
    'category',
    'cho',
    true
);

-- Layer cho CÔNG VIÊN (chỉ hiển thị category='cong_vien')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏞️ Công viên',
    'points_of_interest',
    'POINT',
    'Công viên và khu vui chơi',
    'category',
    'cong_vien',
    true
);

-- Layer cho QUÁN CÀ PHÊ (chỉ hiển thị category='cafe')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '☕ Quán cà phê',
    'points_of_interest',
    'POINT',
    'Quán cà phê và trà',
    'category',
    'cafe',
    true
);

-- Layer cho NGÂN HÀNG (chỉ hiển thị category='ngan_hang')
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🏦 Ngân hàng',
    'points_of_interest',
    'POINT',
    'Ngân hàng và ATM',
    'category',
    'ngan_hang',
    true
);


-- BƯỚC 3: Kiểm tra kết quả
-- ========================================

-- Xem tất cả layers đã đăng ký
SELECT
    id,
    name,
    data_source_table,
    filter_column,
    filter_value,
    is_active
FROM map_layers
ORDER BY id;

-- Đếm số điểm theo category
SELECT
    category,
    COUNT(*) as total_points
FROM points_of_interest
GROUP BY category
ORDER BY total_points DESC;


-- ========================================
-- KẾT QUẢ MONG ĐỢI:
-- ========================================
-- ✅ Bạn sẽ thấy 6 layers mới trong map_layers:
--    - 🏫 Trường học (4 điểm)
--    - 🏥 Bệnh viện (3 điểm)
--    - 🏪 Chợ (3 điểm)
--    - 🏞️ Công viên (2 điểm)
--    - ☕ Quán cà phê (2 điểm)
--    - 🏦 Ngân hàng (2 điểm)
--
-- ✅ Refresh trang web: http://localhost:3000
-- ✅ Click nút 🗺️ Layers
-- ✅ Bạn sẽ thấy 6 checkboxes riêng biệt!
-- ✅ Tick từng checkbox → Chỉ hiển thị đúng loại đó!
--
-- ========================================


-- (OPTIONAL) XÓA DỮ LIỆU TEST NẾU MUỐN BẮT ĐẦU LẠI
-- ========================================
-- Bỏ comment để xóa:

-- DELETE FROM map_layers WHERE filter_column IS NOT NULL;
-- DELETE FROM points_of_interest WHERE category IN ('truong_hoc', 'benh_vien', 'cho', 'cong_vien', 'cafe', 'ngan_hang');
