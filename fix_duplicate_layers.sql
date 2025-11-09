-- ========================================
-- FIX: Xóa/Tắt Layer Trùng Lặp
-- ========================================

-- BƯỚC 1: Kiểm tra các layer hiện tại
-- ========================================
SELECT
    id,
    name,
    data_source_table,
    filter_column,
    filter_value,
    is_active
FROM map_layers
ORDER BY id;


-- BƯỚC 2: TẮT các layer CŨ không có filter
-- ========================================
-- Những layer này hiển thị TẤT CẢ dữ liệu → Gây trùng lặp!

UPDATE map_layers
SET is_active = false
WHERE name IN ('Điểm Quan Tâm', 'Ranh Giới', 'Tuyến Đường')
  AND filter_column IS NULL;

-- Kiểm tra kết quả
SELECT name, is_active FROM map_layers WHERE filter_column IS NULL;


-- BƯỚC 3: (OPTIONAL) Hoặc XÓA LUÔN nếu không cần nữa
-- ========================================
-- Bỏ comment nếu muốn xóa hẳn:

-- DELETE FROM map_layers
-- WHERE name IN ('Điểm Quan Tâm', 'Ranh Giới', 'Tuyến Đường')
--   AND filter_column IS NULL;


-- BƯỚC 4: Kiểm tra layers còn lại
-- ========================================
SELECT
    id,
    name,
    data_source_table,
    filter_column,
    filter_value,
    is_active
FROM map_layers
WHERE is_active = true
ORDER BY id;


-- ========================================
-- KẾT QUẢ MONG ĐỢI:
-- ========================================
-- ✅ Chỉ còn các layer MỚI có filter riêng:
--    - Hang động (filter: hang_dong)
--    - Trường học (filter: truong_hoc)
--    - Bệnh viện (filter: benh_vien)
--    - ...
--
-- ✅ Layer "Điểm Quan Tâm" đã bị tắt/xóa
-- ✅ Không còn trùng lặp dữ liệu!
--
-- ✅ Refresh web → Chỉ thấy layers riêng biệt!
-- ========================================
