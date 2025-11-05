# 📚 INDEX - Danh Sách Tài Liệu Hướng Dẫn

## 🎯 Đọc File Nào Trước?

### 🚀 **Bạn Mới Clone Code Về?**
➡️ Đọc file này trước: **[SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md)**
- Hướng dẫn chi tiết cách setup từ đầu
- Giải thích tại sao phải chạy các lệnh Docker
- 4 bước đơn giản: Clone → Docker → Seed Data → Import SQL

---

### 📍 **Bạn Muốn Thêm Layer Mới?**
➡️ Đọc 2 files này:

1. **[HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)** ⭐
   - Giải thích chi tiết từng bước
   - Có sơ đồ kiến trúc
   - Ví dụ cụ thể: Thêm layer "Trường học", "Bệnh viện"
   - Styling - màu sắc cho layer
   - Kiểm tra ngay sau khi thêm

2. **[CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md)** ⚡
   - Copy & paste nhanh
   - Templates cho Point, Line, Polygon
   - Troubleshooting nhanh

---

### 🏗️ **Bạn Muốn Hiểu Kiến Trúc Hệ Thống?**
➡️ Đọc file này: **[KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md)**
- Sơ đồ tổng quan
- Vai trò từng bảng trong database
- Quy trình hiển thị layer
- Backend & Frontend hoạt động như thế nào
- Tools (Buffer, Intersect) - KHÔNG lưu trong database!

---

### 💾 **Bạn Muốn Import Dữ Liệu Mẫu Nhanh?**
➡️ Làm theo 2 bước:

1. Đọc: **[HUONG_DAN_IMPORT_SQL.md](HUONG_DAN_IMPORT_SQL.md)** (CŨ - có users nhưng phức tạp)
2. Hoặc dùng: **[SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md)** (MỚI - đơn giản hơn)

File SQL để import:
- **[sample_data_gis_only.sql](sample_data_gis_only.sql)** ← Chỉ GIS data (provinces, points, routes)
- **[sample_data_full.sql](sample_data_full.sql)** ← Đầy đủ (kể cả users - nhưng password fake)

---

## 📂 Danh Sách Đầy Đủ

### 🆕 Files Mới (Dành Cho Người Mới)

| File | Mục Đích | Độ Ưu Tiên |
|------|----------|------------|
| **[SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md)** | Hướng dẫn setup từ đầu | ⭐⭐⭐ |
| **[HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)** | Thêm layer mới chi tiết | ⭐⭐⭐ |
| **[CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md)** | Copy & paste nhanh | ⭐⭐ |
| **[KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md)** | Hiểu kiến trúc | ⭐⭐ |
| **[sample_data_gis_only.sql](sample_data_gis_only.sql)** | Import dữ liệu GIS | ⭐⭐⭐ |
| **[set_passwords.py](set_passwords.py)** | Script set password (không cần nếu dùng seed_data) | - |

---

### 📖 Files Cũ (Trong folder `docs/`)

| File | Mục Đích |
|------|----------|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Quick start guide |
| [docs/BAT_DAU_NHANH.md](docs/BAT_DAU_NHANH.md) | Bắt đầu nhanh (tiếng Việt) |
| [docs/HUONG_DAN_CHẠY.md](docs/HUONG_DAN_CHẠY.md) | Hướng dẫn chạy cho người mới |
| [docs/DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md) | Hướng dẫn Docker |
| [docs/HUONG_DAN_CAC_LOAI_GEOMETRY.md](docs/HUONG_DAN_CAC_LOAI_GEOMETRY.md) | Các loại geometry GIS |
| [docs/HUONG_DAN_KET_NOI_PGADMIN.md](docs/HUONG_DAN_KET_NOI_PGADMIN.md) | Kết nối pgAdmin |
| [docs/THEM_DU_LIEU_GIS_NHANH.md](docs/THEM_DU_LIEU_GIS_NHANH.md) | Thêm dữ liệu GIS nhanh |
| [docs/HUONG_DAN_THEM_DU_LIEU_THU_CONG.md](docs/HUONG_DAN_THEM_DU_LIEU_THU_CONG.md) | Thêm dữ liệu thủ công |
| [docs/HUONG_DAN_THEM_DU_LIEU_VAO_BANG.md](docs/HUONG_DAN_THEM_DU_LIEU_VAO_BANG.md) | Thêm dữ liệu vào bảng có sẵn |
| [docs/HUONG_DAN_THEM_LAYER.md](docs/HUONG_DAN_THEM_LAYER.md) | Thêm layer (cũ) |
| [docs/SETUP_DATABASE_MANUAL.md](docs/SETUP_DATABASE_MANUAL.md) | Setup database thủ công |
| [docs/README_POSTGIS_SETUP.md](docs/README_POSTGIS_SETUP.md) | Setup PostGIS |
| [docs/NEXT_STEPS_AFTER_RESTART.md](docs/NEXT_STEPS_AFTER_RESTART.md) | Bước tiếp theo sau restart |

---

## 🗺️ Roadmap Học

### Giai Đoạn 1: Setup & Chạy Lần Đầu (30 phút)
1. ✅ Đọc: [SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md)
2. ✅ Chạy Docker: `docker-compose up -d`
3. ✅ Chạy migrations: `docker exec webgis_backend python manage.py migrate`
4. ✅ Seed data: `docker exec webgis_backend python manage.py seed_data`
5. ✅ Import SQL: [sample_data_gis_only.sql](sample_data_gis_only.sql)
6. ✅ Mở web: http://localhost:3000

---

### Giai Đoạn 2: Hiểu Kiến Trúc (15 phút)
1. ✅ Đọc: [KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md)
2. ✅ Hiểu vai trò từng bảng
3. ✅ Hiểu quy trình Frontend ↔ Backend ↔ Database

---

### Giai Đoạn 3: Thực Hành Thêm Layer (30 phút)
1. ✅ Đọc: [HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)
2. ✅ Thực hành: Thêm layer "Bệnh viện" (copy SQL trong file)
3. ✅ Kiểm tra: pgAdmin → API → Web
4. ✅ Thực hành: Thêm layer tự nghĩ (VD: Siêu thị, Nhà hàng...)

---

### Giai Đoạn 4: Nâng Cao - Styling (30 phút)
1. ✅ Đọc phần Styling trong [HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)
2. ✅ Thực hành: Sửa `getLayerStyle()` trong frontend
3. ✅ Thực hành: Thêm cột `color` vào database
4. ✅ Kiểm tra: Mỗi feature có màu khác nhau

---

### Giai Đoạn 5: Tham Khảo Nhanh
Khi cần thêm layer nhanh, dùng: [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md)
- Copy template
- Sửa tên bảng & tên layer
- Run 3 queries → Xong!

---

## 💡 Tips

### 📌 Khi Cần Tìm Thông Tin Nhanh

| Bạn Muốn | Xem File |
|----------|----------|
| "Tạo bảng GIS như thế nào?" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) → Phần "Tạo Bảng" |
| "Lấy tọa độ từ đâu?" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) → Phần "Lấy Tọa Độ" |
| "Styling màu sắc?" | [HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md) → Phần "Styling" |
| "Layer không hiển thị?" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) → Phần "Làm Gì Nếu..." |
| "Backend xử lý layer như thế nào?" | [KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md) → Phần "Backend Code" |
| "Tools lưu ở đâu?" | [KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md) → Phần "Tools" |

---

### 📌 Khi Gặp Lỗi

| Lỗi | Xem File | Phần |
|-----|----------|------|
| "relation does not exist" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) | "Làm Gì Nếu..." |
| "Layer không hiển thị" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) | "Làm Gì Nếu..." |
| "Geometry NULL" | [CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md) | "Làm Gì Nếu..." |
| "Invalid credentials" | [SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md) | "Xử Lý Lỗi" |
| "Port bị chiếm" | [SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md) | "Xử Lý Lỗi" |

---

## 🎯 Tóm Tắt

**3 Files Quan Trọng Nhất:**
1. **[SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md)** - Setup lần đầu
2. **[HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)** - Thêm layer chi tiết
3. **[CHEAT_SHEET_THEM_LAYER.md](CHEAT_SHEET_THEM_LAYER.md)** - Tra cứu nhanh

**1 File SQL Quan Trọng:**
- **[sample_data_gis_only.sql](sample_data_gis_only.sql)** - Import dữ liệu mẫu

**1 File Hiểu Hệ Thống:**
- **[KIEN_TRUC_HE_THONG.md](KIEN_TRUC_HE_THONG.md)** - Kiến trúc tổng quan

---

**Bắt đầu từ đâu?**
➡️ [SETUP_CHO_BAN_BE.md](SETUP_CHO_BAN_BE.md) ⭐

**Chúc bạn thành công! 🚀**
