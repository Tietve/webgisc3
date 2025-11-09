-- ========================================
-- SCRIPT TEST: LAYER FILTERING V2 (ĐƠN GIẢN HƠN!)
-- Phiên bản này KHÔNG CẦN created_at, updated_at
-- ========================================

-- BƯỚC 0: FIX NULL CONSTRAINT (Chạy 1 lần duy nhất!)
-- ========================================
-- Bỏ comment dòng dưới nếu chưa chạy lần nào:
-- ALTER TABLE map_layers ALTER COLUMN created_at DROP NOT NULL, ALTER COLUMN updated_at DROP NOT NULL;


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
    ('Đại học Bách Khoa', 'truong_hoc', 'Đại học kỹ thuật',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8450,21.0050]}')),

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
    ('Highlands Coffee', 'cafe', 'Chuỗi cà phê Việt Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0289]}')),
    ('Trung Nguyên Legend', 'cafe', 'Cà phê đặc sản Việt',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0278]}')),

    -- 🏦 Ngân hàng
    ('Vietcombank Hàng Bài', 'ngan_hang', 'Ngân hàng thương mại',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8512,21.0312]}')),
    ('BIDV Hoàn Kiếm', 'ngan_hang', 'Ngân hàng đầu tư và phát triển',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8523,21.0301]}')),

    -- 🕳️ Hang động
    ('Hang Sơn Đoòng', 'hang_dong', 'Hang động lớn nhất thế giới',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2840,17.4564]}')),
    ('Hang Én', 'hang_dong', 'Hang động đẹp ở Quảng Bình',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2950,17.4700]}')),

    -- 🏖️ Bãi biển
    ('Bãi biển Mỹ Khê', 'bai_bien', 'Bãi biển đẹp nhất Việt Nam',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2425,16.0544]}')),
    ('Bãi biển Nha Trang', 'bai_bien', 'Bãi biển nổi tiếng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[109.1967,12.2388]}')),

    -- ⛰️ Núi non
    ('Núi Fansipan', 'nui_non', 'Nóc nhà Đông Dương',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[103.7751,22.3021]}')),
    ('Núi Bà Đen', 'nui_non', 'Núi linh thiêng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.1012,11.2108]}'));

-- Kiểm tra dữ liệu đã thêm
SELECT category, COUNT(*) as total
FROM points_of_interest
GROUP BY category
ORDER BY total DESC;


-- BƯỚC 2: Đăng ký các layer (ĐƠN GIẢN HƠN - Không cần created_at, updated_at!)
-- ========================================

INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES
    ('🏫 Trường học', 'points_of_interest', 'POINT', 'Các trường học trên địa bàn', 'category', 'truong_hoc', true),
    ('🏥 Bệnh viện', 'points_of_interest', 'POINT', 'Các bệnh viện và cơ sở y tế', 'category', 'benh_vien', true),
    ('🏪 Chợ', 'points_of_interest', 'POINT', 'Các chợ truyền thống', 'category', 'cho', true),
    ('🏞️ Công viên', 'points_of_interest', 'POINT', 'Công viên và khu vui chơi', 'category', 'cong_vien', true),
    ('☕ Quán cà phê', 'points_of_interest', 'POINT', 'Quán cà phê và trà', 'category', 'cafe', true),
    ('🏦 Ngân hàng', 'points_of_interest', 'POINT', 'Ngân hàng và ATM', 'category', 'ngan_hang', true),
    ('🕳️ Hang động', 'points_of_interest', 'POINT', 'Các hang động du lịch', 'category', 'hang_dong', true),
    ('🏖️ Bãi biển', 'points_of_interest', 'POINT', 'Bãi biển và resort', 'category', 'bai_bien', true),
    ('⛰️ Núi non', 'points_of_interest', 'POINT', 'Đỉnh núi và điểm leo núi', 'category', 'nui_non', true);


-- BƯỚC 3: Kiểm tra kết quả
-- ========================================

-- Xem tất cả layers đã đăng ký
SELECT
    id,
    name,
    filter_value,
    is_active
FROM map_layers
ORDER BY id DESC
LIMIT 10;

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
-- ✅ Bạn sẽ thấy 9 layers mới:
--    🏫 Trường học (4 điểm)
--    🏥 Bệnh viện (3 điểm)
--    🏪 Chợ (3 điểm)
--    🏞️ Công viên (2 điểm)
--    ☕ Quán cà phê (2 điểm)
--    🏦 Ngân hàng (2 điểm)
--    🕳️ Hang động (2 điểm)
--    🏖️ Bãi biển (2 điểm)
--    ⛰️ Núi non (2 điểm)
--
-- ✅ Tổng: 22 điểm, 9 layers
--
-- ✅ Refresh web: http://localhost:3000
-- ✅ Click 🗺️ Layers
-- ✅ Thấy 9 checkboxes riêng biệt!
-- ✅ Tick từng checkbox → Chỉ hiển thị đúng loại!
-- ========================================


-- (OPTIONAL) XÓA DỮ LIỆU TEST NẾU MUỐN BẮT ĐẦU LẠI
-- ========================================

-- DELETE FROM map_layers WHERE filter_column IS NOT NULL;
-- DELETE FROM points_of_interest WHERE category IN ('truong_hoc', 'benh_vien', 'cho', 'cong_vien', 'cafe', 'ngan_hang', 'hang_dong', 'bai_bien', 'nui_non');
