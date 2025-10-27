

## Bước 1: Cài Docker Desktop ⬇️

### Windows:
1. Truy cập: https://www.docker.com/products/docker-desktop/
2. Click nút **"Download for Windows"**
3. Chạy file `Docker Desktop Installer.exe` vừa tải về
4. Làm theo hướng dẫn cài đặt (để mặc định tất cả)
5. **Khởi động lại máy** sau khi cài xong
6. Mở **Docker Desktop** (sẽ có icon trên Desktop)
7. Đợi Docker Desktop khởi động xong (icon Docker ở System Tray màu xanh)

### macOS:
1. Truy cập: https://www.docker.com/products/docker-desktop/
2. Click nút **"Download for Mac"** (chọn chip Intel hoặc Apple Silicon)
3. Mở file `.dmg` vừa tải về
4. Kéo Docker vào thư mục Applications
5. Mở **Docker** từ Applications
6. Cho phép các quyền Docker yêu cầu



**Kiểm tra Docker đã cài thành công:**
- Mở **Command Prompt** (Windows) hoặc **Terminal** (Mac/Linux)
- Gõ lệnh: `docker --version`
- Nếu thấy hiển thị phiên bản Docker → Thành công! ✅

---

## Bước 2: Tải Code Về Máy 📥

### Cách 1: Dùng Git (Khuyến nghị)

**Cài Git trước:**
- Windows: https://git-scm.com/download/win
- macOS: Đã có sẵn hoặc cài qua Homebrew
- Linux: `sudo apt install git`

**Clone repository:**
```bash
# Mở Command Prompt/Terminal
cd Desktop
git clone https://github.com/Tietve/webgisc3.git
cd webgisc3
```

### Cách 2: Tải file ZIP (Đơn giản hơn)

1. Truy cập: https://github.com/Tietve/webgisc3
2. Click nút **"Code"** màu xanh
3. Click **"Download ZIP"**
4. Giải nén file ZIP vừa tải về Desktop
5. Mở **Command Prompt/Terminal**
6. Chuyển đến thư mục:
   ```bash
   cd Desktop/webgisc3-main
   ```

---

## Bước 3: Chạy Docker Containers 🐳

**Đảm bảo Docker Desktop đang chạy** (icon Docker ở System Tray màu xanh)

### Windows:
```bash
# Trong thư mục webgisc3
docker-compose up -d
```

### macOS/Linux:
```bash
# Trong thư mục webgisc3
docker-compose up -d
```

**Giải thích:**
- `docker-compose up`: Khởi động các containers
- `-d`: Chạy ở background (không chiếm terminal)

**Đợi khoảng 5-10 phút** cho Docker tải images và khởi động lần đầu.

### Kiểm tra containers đang chạy:
```bash
docker ps
```

Bạn sẽ thấy **3 containers**:
- `webgis_postgis` - Database PostGIS
- `webgis_backend` - Django API
- `webgis_pgadmin` - pgAdmin (quản lý database)

---

## Bước 4: Tạo Database và Dữ Liệu Mẫu 💾

Chạy script tự động tạo database:

### Windows:
```bash
docker exec webgis_backend python setup_initial_data.py
```

### macOS/Linux:
```bash
docker exec webgis_backend python setup_initial_data.py
```

**Script này sẽ tự động:**
- Bật PostGIS extension
- Tạo 3 GIS tables (points_of_interest, routes, boundaries)
- Tạo users mẫu (admin, teacher, students)
- Tạo classroom và lessons
- Thêm 3 điểm GIS mẫu

**Bạn sẽ thấy:**
```
✅ PostGIS extension enabled
✅ GIS tables created
✅ Sample data inserted
✅ Users created
🎉 Setup complete!
```

---

## Bước 5: Chạy Frontend 🌐

### Windows:
```bash
cd frontend
npm install
npm run dev
```

### macOS/Linux:
```bash
cd frontend
npm install
npm run dev
```

**Lưu ý:** Nếu chưa có Node.js, cài tại: https://nodejs.org/

---

## Bước 6: Truy Cập Ứng Dụng 🎯

Sau khi hoàn tất, mở browser và truy cập:

### 🗺️ **Frontend (Bản đồ)**
- URL: http://localhost:3000
- Trang login sẽ hiện ra

### 🔑 **Tài khoản đăng nhập:**
```
Admin:    admin@webgis.com / admin123
Teacher:  teacher01@webgis.com / teacher123
Student:  student01@webgis.com / student123
```

### 🗄️ **pgAdmin (Quản lý database)**
- URL: http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

### 🔧 **API Backend**
- URL: http://localhost:8080/api/v1/

---

## 🎮 Sử Dụng Bản Đồ

1. **Đăng nhập** bằng một trong các tài khoản trên
2. Vào trang **Map Viewer** hoặc click vào **🗺️ Map** trên menu
3. Click nút **🗺️ Layers** ở góc trên bên phải
4. Bật/tắt các layers:
   - **Điểm Quan Tâm** - Hiển thị các điểm (trường học, hồ nước, chợ...)
   - **Ranh Giới** - Hiển thị ranh giới hành chính
   - **Tuyến Đường** - Hiển thị tuyến đường, xe buýt...

---

## ➕ Thêm Dữ Liệu GIS

### Cách 1: Qua pgAdmin (Dễ nhất)

1. Mở http://localhost:5050
2. Đăng nhập: `admin@admin.com / admin`
3. **Add New Server:**
   - Name: `WebGIS`
   - Connection tab:
     - Host: `db` (không phải localhost!)
     - Port: `5432`
     - Database: `webgis_db`
     - Username: `webgis_user`
     - Password: `webgis_password`
4. Mở **Query Tool**
5. Chạy SQL:

**Thêm trường học:**
```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Trường THPT Chu Văn An',
    'Trường học',
    'Trường trung học phổ thông',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')
);
```

**Thêm tuyến bus:**
```sql
INSERT INTO routes (name, type, length_km, geometry)
VALUES (
    'Tuyến Bus 01',
    'Bus',
    12.5,
    ST_GeomFromGeoJSON('{
        "type":"LineString",
        "coordinates":[
            [105.8234,21.0589],
            [105.8456,21.0334],
            [105.8527,21.0285]
        ]
    }')
);
```

6. **Refresh trang frontend** để xem dữ liệu mới

### Cách 2: Chạy file SQL mẫu

Có sẵn file **`test_all_geometry_types.sql`** trong thư mục gốc với nhiều ví dụ.

Trong pgAdmin:
1. Mở file SQL này
2. Copy toàn bộ nội dung
3. Paste vào Query Tool
4. Click Execute (F5)

---

## 🛑 Dừng Docker

Khi không dùng nữa:

```bash
# Dừng containers (giữ dữ liệu)
docker-compose stop

# Dừng và xóa containers (giữ dữ liệu)
docker-compose down

# Xóa tất cả kể cả dữ liệu (cẩn thận!)
docker-compose down -v
```

---

## 🔄 Khởi Động Lại

Lần sau muốn chạy lại:

```bash
cd Desktop/webgisc3

# Khởi động Docker containers
docker-compose up -d

# Đợi 30 giây cho backend khởi động

# Chạy frontend (terminal mới)
cd frontend
npm run dev
```

**Không cần chạy lại `setup_initial_data.py`** - Dữ liệu đã được lưu!

---

## ❓ Khắc Phục Lỗi Thường Gặp

### 1. "Docker daemon is not running"
**Giải pháp:** Mở Docker Desktop và đợi nó khởi động xong

### 2. "Port 5432 is already allocated"
**Giải pháp:** PostgreSQL đang chạy trên máy. Tắt nó đi:
```bash
# Windows
net stop postgresql

# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

### 3. "Cannot connect to backend API"
**Giải pháp:** Đợi thêm vài phút để backend khởi động. Kiểm tra logs:
```bash
docker logs webgis_backend
```

### 4. "npm install failed"
**Giải pháp:** Cài Node.js từ https://nodejs.org/ (phiên bản LTS)

### 5. "Cannot see data on map"
**Giải pháp:**
- Kiểm tra đã chạy `setup_initial_data.py` chưa
- Kiểm tra đã bật layers trong Map Viewer chưa
- Refresh trang browser (Ctrl+F5)

---

## 📚 Tài Liệu Tham Khảo

Trong thư mục gốc có nhiều file hướng dẫn:

- `HUONG_DAN_KET_NOI_PGADMIN.md` - Kết nối pgAdmin
- `HUONG_DAN_CAC_LOAI_GEOMETRY.md` - Các loại hình học GIS
- `THEM_DU_LIEU_GIS_NHANH.md` - Thêm dữ liệu nhanh
- `test_all_geometry_types.sql` - SQL mẫu đầy đủ

---

## 📞 Cần Trợ Giúp?

Nếu gặp vấn đề:
1. Đọc phần "Khắc Phục Lỗi" ở trên
2. Kiểm tra Docker Desktop đang chạy
3. Kiểm tra logs: `docker logs webgis_backend`
4. Google lỗi cụ thể
5. Hỏi người đã gửi code cho bạn

---

## ✅ Checklist Hoàn Thành

- [ ] Docker Desktop đã cài và đang chạy
- [ ] Code đã tải về máy
- [ ] Chạy `docker-compose up -d` thành công
- [ ] Chạy `setup_initial_data.py` thành công
- [ ] Frontend chạy được ở http://localhost:3000
- [ ] Đăng nhập thành công
- [ ] Nhìn thấy bản đồ và layers
- [ ] Đã thử thêm dữ liệu mới qua pgAdmin

**Chúc bạn thành công! 🎉**
