# Hướng Dẫn Sử Dụng Docker - WebGIS

## 1. Cài Đặt Docker Desktop

Nếu chưa có Docker Desktop, tải và cài đặt tại: https://www.docker.com/products/docker-desktop/

## 2. Chạy Docker Containers

Mở **Command Prompt** hoặc **PowerShell** tại thư mục `D:\Webgis` và chạy:

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Pull (tải về) các images: PostgreSQL/PostGIS, pgAdmin, và build Django
- Tạo và chạy 3 containers
- Hiển thị trong Docker Desktop

**Lưu ý**: Lần đầu chạy sẽ mất 5-10 phút để tải images.

## 3. Kiểm Tra Containers Đang Chạy

```bash
docker ps
```

Bạn sẽ thấy 3 containers:
- `webgis_postgis` - Database PostgreSQL + PostGIS
- `webgis_pgadmin` - Công cụ quản lý database
- `webgis_backend` - Django backend

## 4. Truy Cập pgAdmin

### Bước 1: Mở trình duyệt
Truy cập: **http://localhost:5050**

### Bước 2: Đăng nhập pgAdmin
- **Email**: `admin@webgis.com`
- **Password**: `admin123`

### Bước 3: Kết nối đến PostgreSQL Database

1. Click chuột phải vào **Servers** → chọn **Create** → **Server**

2. Tab **General**:
   - **Name**: `WebGIS Database` (hoặc tên bất kỳ)

3. Tab **Connection**:
   - **Host name/address**: `db` (quan trọng: dùng tên service trong docker-compose)
   - **Port**: `5432`
   - **Maintenance database**: `webgis_db`
   - **Username**: `webgis_user`
   - **Password**: `webgis_password`
   - Tick vào **Save password**

4. Click **Save**

## 5. Import Dữ Liệu Thủ Công vào Database

### Cách 1: Dùng pgAdmin GUI (Đơn giản nhất)

1. Trong pgAdmin, mở rộng:
   - **Servers** → **WebGIS Database** → **Databases** → **webgis_db** → **Schemas** → **public**

2. Click chuột phải vào **Tables** → **Query Tool**

3. Paste SQL script của bạn và nhấn **Execute** (F5)

### Cách 2: Import từ file SQL

1. Click chuột phải vào **webgis_db** → **Restore**
2. Chọn file `.sql` hoặc `.backup` của bạn
3. Click **Restore**

### Cách 3: Import từ CSV

1. Click chuột phải vào bảng → **Import/Export Data**
2. Chọn **Import**
3. Chọn file CSV và cấu hình các cột
4. Click **OK**

### Cách 4: Import GIS Data (Shapefile, GeoJSON)

Sử dụng **PostGIS** extensions:

```sql
-- Tạo extension nếu chưa có
CREATE EXTENSION IF NOT EXISTS postgis;

-- Import từ GeoJSON (ví dụ)
CREATE TABLE my_geo_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(Point, 4326)
);

-- Sau đó import dữ liệu từ pgAdmin hoặc script
```

## 6. Kết Nối Database từ Bên Ngoài (Nếu Cần)

Nếu bạn muốn kết nối từ các công cụ khác (DBeaver, QGIS, Python):

- **Host**: `localhost`
- **Port**: `5433` (mapped từ 5432 trong container)
- **Database**: `webgis_db`
- **User**: `webgis_user`
- **Password**: `webgis_password`

## 7. Truy Cập Django Backend

- **URL**: http://localhost:8080
- Backend API sẽ tự động kết nối với PostgreSQL

## 8. Các Lệnh Docker Hữu Ích

### Dừng containers
```bash
docker-compose down
```

### Khởi động lại
```bash
docker-compose restart
```

### Xem logs
```bash
# Xem tất cả logs
docker-compose logs

# Xem logs của một service cụ thể
docker-compose logs db
docker-compose logs pgadmin
docker-compose logs web
```

### Xem logs real-time
```bash
docker-compose logs -f
```

### Xóa containers và volumes (XÓA DỮ LIỆU!)
```bash
docker-compose down -v
```
**Cảnh báo**: Lệnh này sẽ xóa toàn bộ dữ liệu trong database!

### Rebuild containers (sau khi sửa code)
```bash
docker-compose up -d --build
```

## 9. Xử Lý Sự Cố

### Container không start
```bash
# Xem lỗi chi tiết
docker-compose logs db
```

### Port bị chiếm
Nếu port 5433, 5050, hoặc 8080 đã được sử dụng, sửa trong `docker-compose.yml`:
```yaml
ports:
  - "PORT_MỚI:PORT_TRONG_CONTAINER"
```

### Reset toàn bộ
```bash
docker-compose down -v
docker-compose up -d
```

## 10. Cấu Trúc Dữ Liệu

Các volumes được lưu trữ:
- `postgres_data`: Dữ liệu PostgreSQL
- `pgadmin_data`: Cấu hình pgAdmin

Dữ liệu sẽ được giữ nguyên ngay cả khi bạn `docker-compose down` (không dùng `-v`)

---

## Tóm Tắt Nhanh

1. **Chạy Docker**: `docker-compose up -d`
2. **Mở pgAdmin**: http://localhost:5050 (admin@webgis.com / admin123)
3. **Kết nối Database**: Host=`db`, Port=`5432`, User=`webgis_user`, Password=`webgis_password`
4. **Import dữ liệu**: Dùng Query Tool hoặc Import/Export trong pgAdmin
5. **Dừng Docker**: `docker-compose down`

---

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề, check logs: `docker-compose logs [service_name]`
