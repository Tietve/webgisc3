# Hướng Dẫn Kết Nối pgAdmin - Chi Tiết Từng Bước

## 🤔 "Connect to Server" là gì?

**pgAdmin** là phần mềm giao diện để quản lý database PostgreSQL. Khi bạn mở pgAdmin lần đầu, nó chưa biết database của bạn ở đâu.

Bạn cần **"kết nối"** (connect) pgAdmin đến **"server"** (database PostgreSQL đang chạy trong Docker).

**Hiểu đơn giản:**
- **pgAdmin** = Cái remote điều khiển TV
- **Server/Database** = Cái TV
- **Connect to Server** = Nối remote với TV để điều khiển được

---

## 📝 Bước 1: Mở pgAdmin

1. Mở trình duyệt web
2. Truy cập: **http://localhost:5050**
3. Bạn sẽ thấy màn hình đăng nhập

**Nhập thông tin:**
```
Email Address: admin@webgis.com
Password: admin123
```

4. Click **Login**

---

## 📝 Bước 2: Tạo Kết Nối Mới

Sau khi đăng nhập, bạn sẽ thấy giao diện pgAdmin:

### 2.1. Mở Menu Tạo Server

Bên trái màn hình, bạn sẽ thấy:

```
Servers
  └─ (có thể rỗng hoặc có vài server mẫu)
```

**Click chuột phải** vào chữ **"Servers"** → Chọn **"Create"** → Chọn **"Server..."**

```
Servers (click chuột phải vào đây)
  ↓
  📋 Create
    ↓
    🖥️ Server...  ← Click vào đây
```

### 2.2. Cửa Sổ "Create - Server" Mở Ra

Bạn sẽ thấy một cửa sổ popup với nhiều tab:
- **General** (Tab đầu tiên)
- **Connection** (Tab quan trọng nhất)
- SSL
- Advanced
- ...

---

## 📝 Bước 3: Điền Thông Tin - Tab "General"

Tab **General** (tab đầu tiên):

```
┌─────────────────────────────────────┐
│ Create - Server                     │
├─────────────────────────────────────┤
│ [General] [Connection] [SSL] ...    │
├─────────────────────────────────────┤
│                                     │
│ Name: [___________________________] │
│       ↑ Điền tên bất kỳ             │
│                                     │
└─────────────────────────────────────┘
```

**Điền:**
- **Name**: `WebGIS Database` (hoặc tên bất kỳ bạn thích)

**Giải thích:**
- Đây chỉ là **tên hiển thị** trong pgAdmin thôi, bạn đặt gì cũng được.
- Ví dụ: "Database của tôi", "WebGIS DB", "My Database"...

---

## 📝 Bước 4: Điền Thông Tin - Tab "Connection" ⭐ QUAN TRỌNG

Click vào tab **"Connection"** (bên cạnh tab General):

```
┌──────────────────────────────────────────────┐
│ Create - Server                              │
├──────────────────────────────────────────────┤
│ [General] [Connection] [SSL] ...             │
├──────────────────────────────────────────────┤
│                                              │
│ Host name/address: [____________________]   │
│ Port:              [____________________]   │
│ Maintenance database: [_________________]   │
│ Username:          [____________________]   │
│ Password:          [____________________]   │
│ ☐ Save password                             │
│                                              │
└──────────────────────────────────────────────┘
```

### ⚠️ QUAN TRỌNG - Điền chính xác như sau:

| Trường | Giá trị | Giải thích |
|--------|---------|------------|
| **Host name/address** | `db` | Tên container database trong Docker |
| **Port** | `5432` | Cổng PostgreSQL (KHÔNG phải 5433!) |
| **Maintenance database** | `webgis_db` | Tên database |
| **Username** | `webgis_user` | Tên đăng nhập database |
| **Password** | `webgis_password` | Mật khẩu database |
| **Save password** | ✓ Tích vào | Để lần sau không phải nhập lại |

### 🔍 Chi Tiết Từng Trường:

#### 1. Host name/address = `db`
**TẠI SAO LẠI LÀ `db` CHỨ KHÔNG PHẢI `localhost`?**

- pgAdmin đang chạy **TRONG** Docker container
- Database cũng chạy **TRONG** Docker container khác
- Trong Docker, các container nói chuyện với nhau qua **tên service**
- Trong file `docker-compose.yml`, database có tên service là `db`

```yaml
# Trong docker-compose.yml
services:
  db:           ← Tên này
    image: postgis/postgis:14-3.4
```

**Nếu bạn điền `localhost`:** ❌ SẼ BÁO LỖI!
**Phải điền `db`:** ✅ MỚI KẾT NỐI ĐƯỢC!

#### 2. Port = `5432`
**TẠI SAO LẠI LÀ `5432` CHỨ KHÔNG PHẢI `5433`?**

- `5433` là cổng để kết nối từ **BÊN NGOÀI** Docker (từ máy tính của bạn)
- `5432` là cổng **BÊN TRONG** Docker (giữa các container)
- pgAdmin đang chạy **TRONG** Docker → dùng cổng bên trong = `5432`

```yaml
# Trong docker-compose.yml
ports:
  - "5433:5432"
     ↑      ↑
  bên ngoài:bên trong
```

#### 3. Maintenance database = `webgis_db`
- Tên database bạn muốn kết nối
- Được định nghĩa trong `docker-compose.yml`:

```yaml
environment:
  POSTGRES_DB: webgis_db  ← Tên này
```

#### 4. Username = `webgis_user`
- Tên tài khoản để đăng nhập vào database
- Được định nghĩa trong `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: webgis_user  ← Tên này
```

#### 5. Password = `webgis_password`
- Mật khẩu của tài khoản `webgis_user`
- Được định nghĩa trong `docker-compose.yml`:

```yaml
environment:
  POSTGRES_PASSWORD: webgis_password  ← Mật khẩu này
```

#### 6. Save password = ✓ Tích vào
- Để lần sau mở pgAdmin không phải nhập lại password

---

## 📝 Bước 5: Lưu Kết Nối

Sau khi điền đầy đủ thông tin:

1. Kiểm tra lại tất cả thông tin
2. Click nút **"Save"** ở góc dưới bên phải

```
┌──────────────────────────────────────┐
│                                      │
│  [Cancel]              [Save] ←Click │
└──────────────────────────────────────┘
```

---

## 📝 Bước 6: Kết Nối Thành Công!

### ✅ Nếu Thành Công:

Bên trái sẽ xuất hiện:

```
Servers
  └─ 🖥️ WebGIS Database
      └─ Databases (1)
          └─ 📁 webgis_db
              ├─ Schemas
              │   └─ public
              │       ├─ Tables
              │       │   ├─ users
              │       │   ├─ classrooms
              │       │   ├─ lessons
              │       │   ├─ points_of_interest  ← Bảng GIS
              │       │   ├─ boundaries           ← Bảng GIS
              │       │   ├─ routes               ← Bảng GIS
              │       │   └─ ...
              │       └─ Views
              └─ Login/Group Roles
```

**Chúc mừng!** Bạn đã kết nối thành công! 🎉

### ❌ Nếu Báo Lỗi:

#### Lỗi 1: "could not connect to server"
```
could not connect to server: Connection refused
```

**Nguyên nhân:** Docker chưa chạy hoặc database chưa start

**Cách sửa:**
```bash
# Kiểm tra Docker có chạy không
docker ps

# Nếu không thấy container, khởi động lại
docker-compose up -d
```

#### Lỗi 2: "FATAL: password authentication failed"
```
FATAL: password authentication failed for user "webgis_user"
```

**Nguyên nhân:** Sai username hoặc password

**Cách sửa:** Kiểm tra lại:
- Username: `webgis_user` (không phải `admin`)
- Password: `webgis_password` (không phải `admin123`)

#### Lỗi 3: "could not translate host name 'localhost'"
```
could not translate host name "localhost" to address
```

**Nguyên nhân:** Bạn điền `localhost` thay vì `db`

**Cách sửa:** Sửa lại **Host name/address** = `db`

---

## 🎯 Tóm Tắt Thông Tin Kết Nối

Copy và dùng thông tin này:

```
╔════════════════════════════════════════╗
║   THÔNG TIN KẾT NỐI PGADMIN           ║
╠════════════════════════════════════════╣
║ Tab General:                           ║
║   Name: WebGIS Database                ║
║                                        ║
║ Tab Connection:                        ║
║   Host name/address: db                ║
║   Port: 5432                           ║
║   Maintenance database: webgis_db      ║
║   Username: webgis_user                ║
║   Password: webgis_password            ║
║   Save password: ✓                     ║
╚════════════════════════════════════════╝
```

---

## 📝 Bước 7: Mở Query Tool Để Thêm Dữ Liệu

Sau khi kết nối thành công:

1. Mở rộng cây bên trái:
   ```
   Servers → WebGIS Database → Databases → webgis_db
   ```

2. **Click chuột phải** vào `webgis_db`

3. Chọn **"Query Tool"**

4. Cửa sổ SQL editor sẽ mở ra → Bạn có thể gõ SQL để thêm dữ liệu!

### Ví dụ: Thêm điểm nhanh

```sql
-- Thêm một điểm mới
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Nhà hát lớn Hà Nội',
    'Văn hóa',
    'Nhà hát opera nổi tiếng',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8567, 21.0233]}')
);

-- Xem kết quả
SELECT id, name, category, ST_AsText(geometry)
FROM points_of_interest
ORDER BY id DESC
LIMIT 5;
```

Paste vào Query Tool → Nhấn **F5** hoặc nút **▶️** để chạy!

---

## 🔧 Xử Lý Sự Cố

### Không thấy nút "Create Server"?

- Đảm bảo bạn đang **click chuột phải** vào chữ **"Servers"** (không phải vào chỗ khác)
- Thử refresh lại trang pgAdmin

### Kết nối được nhưng không thấy bảng?

1. Mở rộng: `Databases → webgis_db → Schemas → public → Tables`
2. Nếu không thấy, click chuột phải vào `Tables` → **Refresh**

### Muốn kết nối lại?

- Click đúp vào tên server `WebGIS Database` bên trái
- Nếu bị ngắt kết nối, pgAdmin sẽ tự động kết nối lại

---

## 💡 Lưu Ý Quan Trọng

### 1. Phân biệt 2 loại đăng nhập:

| Đăng nhập vào đâu | Email/Username | Password |
|-------------------|----------------|----------|
| **pgAdmin** (giao diện web) | `admin@webgis.com` | `admin123` |
| **Database** (PostgreSQL) | `webgis_user` | `webgis_password` |

### 2. Phân biệt 2 loại Port:

| Kết nối từ đâu | Host | Port |
|----------------|------|------|
| **Bên ngoài Docker** (DBeaver, Python...) | `localhost` | `5433` |
| **Bên trong Docker** (pgAdmin) | `db` | `5432` |

### 3. Một số thắc mắc thường gặp:

**Q: Tại sao phải điền `db` mà không phải `localhost`?**
A: Vì pgAdmin chạy TRONG Docker, nên phải dùng tên service của database container.

**Q: Tôi có thể đổi password không?**
A: Có, nhưng phải sửa trong file `docker-compose.yml` và rebuild Docker.

**Q: Làm sao biết database đã chạy chưa?**
A: Chạy `docker ps` và tìm container `webgis_postgis`. Nếu có STATUS "Up" là đã chạy.

---

## 🎓 Sau Khi Kết Nối Xong

Bây giờ bạn có thể:

✅ Xem danh sách bảng
✅ Mở Query Tool
✅ Chạy câu lệnh SQL
✅ Thêm dữ liệu GIS vào các bảng:
   - `points_of_interest`
   - `boundaries`
   - `routes`

**Đọc file `THEM_DU_LIEU_GIS_NHANH.md` để biết cách thêm dữ liệu!**

---

## 📞 Cần Thêm Trợ Giúp?

- File hướng dẫn khác: `BAT_DAU_NHANH.md`, `DOCKER_GUIDE.md`
- Xem logs: `docker logs webgis_postgis`
- Kiểm tra Docker: `docker ps`

**Chúc bạn thành công!** 🚀
