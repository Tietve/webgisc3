

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


