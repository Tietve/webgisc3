# 🎉 HƯỚNG DẪN: Thêm Layer Với Filter (CỰC ĐỖN GIẢN!)

## ✅ ĐÃ SỬA XONG!

Backend đã được cập nhật để hỗ trợ **filter theo category**!

Bây giờ bạn chỉ cần **2 BƯỚC ĐƠN GIẢN** trong pgAdmin!

---

## 📝 CÁCH SỬ DỤNG

### **BƯỚC 1: Thêm Dữ Liệu Vào `points_of_interest`**

```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES
    ('THPT Trần Phú', 'truong_hoc', 'Trường THPT',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')),
    ('THCS Nguyễn Du', 'truong_hoc', 'Trường THCS',
     ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8456,21.0334]}'));
```

### **BƯỚC 2: Đăng Ký Layer Với Filter**

```sql
INSERT INTO map_layers (name, data_source_table, geom_type, filter_column, filter_value, is_active)
VALUES (
    '🏫 Trường học',           -- Tên hiển thị trên web
    'points_of_interest',      -- Tên bảng chứa dữ liệu
    'POINT',                   -- Loại geometry
    'category',                -- ← Tên cột để filter
    'truong_hoc',              -- ← Giá trị để filter
    true                       -- Bật layer
);
```

**✅ XONG! Refresh web → Thấy layer riêng biệt!**

---

## 🧪 TEST NGAY: File `test_filter_layers.sql`

1. Mở pgAdmin
2. Click phải vào database **webgis** → **Query Tool**
3. Mở file: `D:\Webgis\test_filter_layers.sql`
4. Nhấn **Execute** (F5)
5. Refresh trang web: **http://localhost:3000**
6. Click 🗺️ **Layers**
7. Bạn sẽ thấy:
   - ☐ 🏫 Trường học (4 điểm)
   - ☐ 🏥 Bệnh viện (3 điểm)
   - ☐ 🏪 Chợ (3 điểm)
   - ☐ 🏞️ Công viên (2 điểm)
   - ☐ ☕ Quán cà phê (2 điểm)
   - ☐ 🏦 Ngân hàng (2 điểm)

**✅ Tick từng checkbox → Chỉ hiển thị đúng loại!**

---

## 💡 VÍ DỤ THỰC TẾ

### Thêm Nhiều Trường Học

```sql
-- Thêm dữ liệu
INSERT INTO points_of_interest (name, category, geometry)
VALUES
    ('THPT Chu Văn An', 'truong_hoc', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8200,21.0250]}')),
    ('THPT Nguyễn Huệ', 'truong_hoc', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8300,21.0350]}')),
    ('Đại học Bách Khoa', 'truong_hoc', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8450,21.0050]}'));

-- Đăng ký layer (CHỈ LÀM 1 LẦN!)
INSERT INTO map_layers (name, data_source_table, geom_type, filter_column, filter_value, is_active)
VALUES ('🏫 Trường học', 'points_of_interest', 'POINT', 'category', 'truong_hoc', true);
```

**✅ Refresh web → Thấy layer "Trường học" với TẤT CẢ các trường!**

---

## 🎯 CÁC CATEGORY ĐỀ XUẤT

| Category | Tên Layer | Icon |
|----------|-----------|------|
| `truong_hoc` | Trường học | 🏫 |
| `benh_vien` | Bệnh viện | 🏥 |
| `cho` | Chợ | 🏪 |
| `cong_vien` | Công viên | 🏞️ |
| `cafe` | Quán cà phê | ☕ |
| `ngan_hang` | Ngân hàng | 🏦 |
| `nha_hang` | Nhà hàng | 🍽️ |
| `tram_xang` | Trạm xăng | ⛽ |
| `sieu_thi` | Siêu thị | 🏬 |
| `van_phong` | Văn phòng | 🏢 |

---

## 🔥 LỢI ÍCH

### ✅ **SO VỚI CÁCH CŨ (Tạo VIEW):**

| | Cách Cũ (VIEW) | Cách Mới (FILTER) |
|---|---|---|
| **Số bước** | 3 bước | 2 bước |
| **Tạo VIEW?** | ✅ Cần | ❌ Không cần |
| **Sửa code?** | ❌ Không | ✅ Đã sửa (1 lần) |
| **Độ phức tạp** | 🔴 Khó | 🟢 Đơn giản |
| **Performance** | 🟢 Tốt | 🟢 Tốt |

### ✅ **SO VỚI 1 LAYER CHUNG:**

| | 1 Layer Chung | Filter Riêng |
|---|---|---|
| **Bật/tắt riêng?** | ❌ Không | ✅ Có |
| **Performance** | 🔴 Chậm khi nhiều | 🟢 Nhanh |
| **UX** | 🔴 Rối | 🟢 Rõ ràng |
| **Scalable?** | ❌ Không | ✅ Có |

---

## ❓ FAQ

### **Q: Tôi thêm nhiều điểm cùng category, có tự lên không?**
**A:** ✅ **CÓ!** Chỉ cần category giống nhau → Tự động hiển thị trong layer đã đăng ký!

```sql
-- Thêm 10 trường học mới
INSERT INTO points_of_interest (name, category, geometry) VALUES
    ('Trường 1', 'truong_hoc', ...),
    ('Trường 2', 'truong_hoc', ...),
    ...
    ('Trường 10', 'truong_hoc', ...);

-- ✅ Refresh web → 10 điểm mới tự động hiện trong layer "Trường học"!
```

### **Q: Mỗi loại mới phải đăng ký layer không?**
**A:** ✅ **CÓ!** Nhưng chỉ đăng ký **1 LẦN DUY NHẤT** cho mỗi loại.

```sql
-- Đăng ký layer "Bệnh viện" (1 LẦN)
INSERT INTO map_layers (...) VALUES (..., 'benh_vien', ...);

-- Sau đó chỉ cần thêm dữ liệu (NHIỀU LẦN)
INSERT INTO points_of_interest (name, category, geometry)
VALUES ('BV mới 1', 'benh_vien', ...);

INSERT INTO points_of_interest (name, category, geometry)
VALUES ('BV mới 2', 'benh_vien', ...);

-- ✅ Tất cả tự động hiện trong layer "Bệnh viện"!
```

### **Q: Có cần tạo VIEW không?**
**A:** ❌ **KHÔNG CẦN!** Đây là cách đơn giản hơn VIEW!

### **Q: Bảng map_layers đã có chưa?**
**A:** ✅ **ĐÃ CÓ!** Refresh pgAdmin để thấy bảng `map_layers` với 2 cột mới:
   - `filter_column`
   - `filter_value`

---

## 🎊 TÓM TẮT

### Quy Trình Hoàn Chỉnh

```sql
-- 1. Thêm dữ liệu (NHIỀU LẦN, bao nhiêu cũng được)
INSERT INTO points_of_interest (name, category, geometry) VALUES (...);

-- 2. Đăng ký layer (CHỈ 1 LẦN cho mỗi category)
INSERT INTO map_layers (name, data_source_table, geom_type, filter_column, filter_value, is_active)
VALUES ('Tên Layer', 'points_of_interest', 'POINT', 'category', 'ten_category', true);

-- 3. Refresh web → XONG!
```

**🎉 ĐƠN GIẢN VẬY THÔI!**

---

**File test mẫu:** `test_filter_layers.sql`

**Refresh pgAdmin để thấy bảng `map_layers` với cột mới!**
