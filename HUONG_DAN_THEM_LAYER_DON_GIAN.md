# 🎯 HƯỚNG DẪN THÊM LAYER ĐƠN GIẢN NHẤT

## ⚡ SETUP 1 LẦN (Chạy file fix trước)

**QUAN TRỌNG:** Chạy file này trước khi thêm layer:

```sql
-- File: fix_created_at_updated_at.sql
-- Mục đích: Cho phép bỏ qua created_at và updated_at

-- Chỉ cần chạy 1 LẦN DUY NHẤT!
```

1. Mở **pgAdmin**
2. Click phải database **webgis** → **Query Tool**
3. Mở file: `D:\Webgis\fix_created_at_updated_at.sql`
4. Nhấn **Execute** (F5)
5. **✅ XONG!** Từ giờ không cần nhập `created_at`, `updated_at` nữa!

---

## 🚀 CÁCH THÊM LAYER MỚI (CỰC ĐƠN GIẢN)

### **BƯỚC 1: Thêm Dữ Liệu**

```sql
-- Thêm điểm vào bảng points_of_interest
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('Hang Sơn Đoòng', 'hang_dong', 'Hang động lớn nhất thế giới',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2840,17.4564]}')),
    ('Hang Én', 'hang_dong', 'Hang động đẹp ở Quảng Bình',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2950,17.4700]}'));
```

### **BƯỚC 2: Đăng Ký Layer**

```sql
-- Đăng ký layer - SIÊU ĐƠN GIẢN!
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES (
    '🕳️ Hang động',           -- Tên hiển thị
    'points_of_interest',      -- Bảng dữ liệu
    'POINT',                   -- Loại geometry
    'Các hang động du lịch',   -- Mô tả
    'category',                -- Cột filter
    'hang_dong',               -- Giá trị filter
    true                       -- Bật layer
);
```

**✅ XONG! Refresh web → Thấy layer mới!**

---

## 📝 VÍ DỤ ĐẦY ĐỦ

### **Thêm Nhiều Loại Điểm:**

```sql
-- 1. Thêm dữ liệu
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    -- Hang động
    ('Hang Sơn Đoòng', 'hang_dong', 'Hang lớn nhất thế giới',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2840,17.4564]}')),
    ('Hang Én', 'hang_dong', 'Hang động đẹp',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.2950,17.4700]}')),

    -- Bãi biển
    ('Bãi biển Mỹ Khê', 'bai_bien', 'Bãi biển đẹp nhất VN',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[108.2425,16.0544]}')),
    ('Bãi biển Nha Trang', 'bai_bien', 'Bãi biển nổi tiếng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[109.1967,12.2388]}')),

    -- Núi non
    ('Núi Fansipan', 'nui_non', 'Nóc nhà Đông Dương',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[103.7751,22.3021]}')),
    ('Núi Bà Đen', 'nui_non', 'Núi linh thiêng',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.1012,11.2108]}'));

-- 2. Đăng ký layers
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES
    ('🕳️ Hang động', 'points_of_interest', 'POINT', 'Các hang động du lịch', 'category', 'hang_dong', true),
    ('🏖️ Bãi biển', 'points_of_interest', 'POINT', 'Bãi biển và resort', 'category', 'bai_bien', true),
    ('⛰️ Núi non', 'points_of_interest', 'POINT', 'Đỉnh núi và điểm leo núi', 'category', 'nui_non', true);
```

**✅ Refresh web → Thấy 3 layers mới với tổng 6 điểm!**

---

## 🎯 CÔNG THỨC CHUNG

### **1. Thêm Dữ Liệu:**
```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES ('Tên điểm', 'ten_category', 'Mô tả', ST_GeomFromGeoJSON('...'));
```

### **2. Đăng Ký Layer:**
```sql
INSERT INTO map_layers (name, data_source_table, geom_type, description, filter_column, filter_value, is_active)
VALUES ('Tên Layer', 'points_of_interest', 'POINT', 'Mô tả', 'category', 'ten_category', true);
```

**🎊 VẬY LÀ XONG!**

---

## 📋 DANH SÁCH CATEGORY ĐỀ XUẤT

| Category Code | Tên Tiếng Việt | Icon |
|---------------|----------------|------|
| `truong_hoc` | Trường học | 🏫 |
| `benh_vien` | Bệnh viện | 🏥 |
| `cho` | Chợ | 🏪 |
| `cong_vien` | Công viên | 🏞️ |
| `cafe` | Quán cà phê | ☕ |
| `ngan_hang` | Ngân hàng | 🏦 |
| `nha_hang` | Nhà hàng | 🍽️ |
| `tram_xang` | Trạm xăng | ⛽ |
| `hang_dong` | Hang động | 🕳️ |
| `bai_bien` | Bãi biển | 🏖️ |
| `nui_non` | Núi non | ⛰️ |
| `chua_den` | Chùa đền | ⛩️ |
| `khach_san` | Khách sạn | 🏨 |
| `sieu_thi` | Siêu thị | 🏬 |
| `san_bay` | Sân bay | ✈️ |

---

## ❓ FAQ

### **Q: Tại sao không cần `created_at`, `updated_at` nữa?**
**A:** Đã chạy script `fix_created_at_updated_at.sql` để cho phép NULL!

### **Q: Thêm nhiều điểm cùng category, có tự hiện không?**
**A:** ✅ **TỰ ĐỘNG HIỆN!** Layer đã đăng ký sẽ load tất cả điểm có cùng category.

### **Q: Muốn xóa layer?**
```sql
DELETE FROM map_layers WHERE name = 'Tên layer';
```

### **Q: Muốn sửa layer?**
```sql
UPDATE map_layers
SET name = 'Tên mới', description = 'Mô tả mới'
WHERE id = 123;
```

---

## 🎉 TÓM TẮT

### **QUY TRÌNH 3 BƯỚC:**

1. **Setup 1 lần:** Chạy `fix_created_at_updated_at.sql` ✅
2. **Thêm dữ liệu:** `INSERT INTO points_of_interest` 📝
3. **Đăng ký layer:** `INSERT INTO map_layers` 🗺️

**→ Refresh web → XONG!** 🎊

---

## 📁 CÁC FILE LIÊN QUAN

- `fix_created_at_updated_at.sql` - Fix NULL constraint (chạy 1 lần)
- `test_filter_layers.sql` - Dữ liệu mẫu đầy đủ
- `HUONG_DAN_THEM_LAYER_VOI_FILTER.md` - Hướng dẫn chi tiết

---

**Đơn giản vậy thôi! Chỉ 2 câu INSERT SQL là xong!** 😊
