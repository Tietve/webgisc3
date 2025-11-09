-- ============================================
-- Thêm dữ liệu Point vào bảng points_of_interest
-- ============================================

-- Thêm các trường học
INSERT INTO points_of_interest (name, category, description, geometry) VALUES
-- Hà Nội
('Đại học Bách Khoa Hà Nội', 'Trường học', 'Trường đại học kỹ thuật hàng đầu Việt Nam', ST_SetSRID(ST_MakePoint(105.8436, 21.0053), 4326)),
('Đại học Quốc Gia Hà Nội', 'Trường học', 'Đại học quốc gia lớn nhất miền Bắc', ST_SetSRID(ST_MakePoint(105.7851, 21.0380), 4326)),
('Trường THPT Chu Văn An', 'Trường học', 'Trường THPT danh tiếng tại Hà Nội', ST_SetSRID(ST_MakePoint(105.8369, 21.0187), 4326)),

-- TP. Hồ Chí Minh
('Đại học Quốc Gia TP.HCM', 'Trường học', 'Đại học quốc gia lớn nhất miền Nam', ST_SetSRID(ST_MakePoint(106.8024, 10.8734), 4326)),
('Đại học Bách Khoa TP.HCM', 'Trường học', 'Trường đại học kỹ thuật hàng đầu miền Nam', ST_SetSRID(ST_MakePoint(106.8026, 10.8801), 4326)),

-- Đà Nẵng
('Đại học Đà Nẵng', 'Trường học', 'Đại học lớn nhất miền Trung', ST_SetSRID(ST_MakePoint(108.1506, 16.0738), 4326)),

-- Thêm các bệnh viện
('Bệnh viện Bạch Mai', 'Bệnh viện', 'Bệnh viện lớn nhất Hà Nội', ST_SetSRID(ST_MakePoint(105.8411, 21.0008), 4326)),
('Bệnh viện Chợ Rẫy', 'Bệnh viện', 'Bệnh viện lớn nhất TP.HCM', ST_SetSRID(ST_MakePoint(106.6544, 10.7544), 4326)),
('Bệnh viện Đà Nẵng', 'Bệnh viện', 'Bệnh viện trung tâm Đà Nẵng', ST_SetSRID(ST_MakePoint(108.2169, 16.0471), 4326)),

-- Thêm các điểm du lịch
('Văn Miếu Quốc Tử Giám', 'Di tích', 'Trường đại học đầu tiên của Việt Nam', ST_SetSRID(ST_MakePoint(105.8356, 21.0276), 4326)),
('Lăng Chủ tịch Hồ Chí Minh', 'Di tích', 'Lăng Bác tại Ba Đình', ST_SetSRID(ST_MakePoint(105.8345, 21.0368), 4326)),
('Dinh Độc Lập', 'Di tích', 'Dinh thống nhất TP.HCM', ST_SetSRID(ST_MakePoint(106.6956, 10.7769), 4326)),
('Bà Nà Hills', 'Du lịch', 'Khu du lịch nổi tiếng Đà Nẵng', ST_SetSRID(ST_MakePoint(107.9978, 15.9961), 4326)),
('Bãi biển Mỹ Khê', 'Bãi biển', 'Bãi biển đẹp nhất Đà Nẵng', ST_SetSRID(ST_MakePoint(108.2472, 16.0471), 4326)),

-- Thêm các công viên
('Công viên Thống Nhất', 'Công viên', 'Công viên lớn tại Hà Nội', ST_SetSRID(ST_MakePoint(105.8428, 21.0108), 4326)),
('Công viên 30/4', 'Công viên', 'Công viên trung tâm TP.HCM', ST_SetSRID(ST_MakePoint(106.6979, 10.7683), 4326)),
('Công viên Biển Đông', 'Công viên', 'Công viên ven biển Đà Nẵng', ST_SetSRID(ST_MakePoint(108.2422, 16.0639), 4326));

-- Kiểm tra kết quả
SELECT
    category,
    COUNT(*) as so_luong
FROM points_of_interest
GROUP BY category
ORDER BY so_luong DESC;

SELECT
    'Tổng số điểm đã thêm:' as thong_tin,
    COUNT(*) as so_luong
FROM points_of_interest;
