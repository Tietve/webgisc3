-- ========================================
-- FIX: Cho phép NULL cho created_at và updated_at
-- ========================================
-- Mục đích: Không bắt buộc phải nhập 2 cột này khi INSERT
-- Chạy script này 1 LẦN trong pgAdmin

-- Bỏ ràng buộc NOT NULL
ALTER TABLE map_layers
ALTER COLUMN created_at DROP NOT NULL,
ALTER COLUMN updated_at DROP NOT NULL;

-- Kiểm tra kết quả
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'map_layers'
AND column_name IN ('created_at', 'updated_at');

-- ========================================
-- KẾT QUẢ MONG ĐỢI:
-- ========================================
-- column_name  | data_type                   | is_nullable
-- created_at   | timestamp without time zone | YES  ← Cho phép NULL
-- updated_at   | timestamp without time zone | YES  ← Cho phép NULL
-- ========================================

-- ========================================
-- TEST: INSERT KHÔNG CẦN created_at, updated_at
-- ========================================

INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES
    ('🕳️ Hang động', 'points_of_interest', 'POINT', 'Các hang động du lịch', 'category', 'hang_dong', true),
    ('🏖️ Bãi biển', 'points_of_interest', 'POINT', 'Bãi biển và resort', 'category', 'bai_bien', true),
    ('⛰️ Núi non', 'points_of_interest', 'POINT', 'Đỉnh núi và điểm leo núi', 'category', 'nui_non', true);

-- Kiểm tra dữ liệu vừa thêm
SELECT
    id,
    name,
    filter_value,
    created_at,  -- Sẽ là NULL
    updated_at   -- Sẽ là NULL
FROM map_layers
WHERE filter_value IN ('hang_dong', 'bai_bien', 'nui_non')
ORDER BY id DESC;

-- ✅ THÀNH CÔNG! Không còn lỗi NULL constraint nữa!
