-- ========================================
-- KIỂM TRA CÁC LAYER ĐANG ACTIVE
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
-- KẾT QUẢ DỰ ĐOÁN:
-- ========================================
-- Bạn sẽ thấy:
-- id | name              | data_source_table    | filter_column | filter_value
-- 1  | Điểm Quan Tâm     | points_of_interest   | NULL          | NULL          ← VẤN ĐỀ Ở ĐÂY!
-- 2  | Ranh Giới         | boundaries           | NULL          | NULL
-- 3  | Tuyến Đường       | routes               | NULL          | NULL
-- 9  | Hang động         | points_of_interest   | category      | hang_dong
--
-- → Layer "Điểm Quan Tâm" KHÔNG CÓ filter → Hiện TẤT CẢ!
-- → Layer "Hang động" CÓ filter → Chỉ hiện hang động!
-- → Dữ liệu bị TRÙNG!
-- ========================================
