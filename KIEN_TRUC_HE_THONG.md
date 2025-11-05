# 🏗️ Kiến Trúc Hệ Thống WebGIS - Giải Thích Đơn Giản

## 📊 Tổng Quan

```
┌─────────────────────────────────────────────────────┐
│  NGƯỜI DÙNG                                         │
│  - Mở trình duyệt                                   │
│  - Vào http://localhost:3000                        │
│  - Click nút 🗺️ để xem layers                      │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Giao diện web
                 ▼
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React + Leaflet)                         │
│  📁 Folder: frontend/src/                           │
│                                                      │
│  Công việc:                                         │
│  1. Hiển thị bản đồ (OpenStreetMap)                │
│  2. Fetch danh sách layers từ API                  │
│  3. Khi user tick checkbox → fetch GeoJSON         │
│  4. Vẽ GeoJSON lên bản đồ                          │
│  5. Styling (màu sắc) - hard-code trong code       │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTP API
                 │ GET /api/v1/layers/
                 │ GET /api/v1/layers/{id}/features/
                 ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND (Django REST Framework)                    │
│  📁 Folder: apps/gis_data/                          │
│                                                      │
│  Công việc:                                         │
│  1. Nhận request từ frontend                       │
│  2. Query database để lấy layers                   │
│  3. Đọc bảng data_source_table                     │
│  4. Convert geometry → GeoJSON                      │
│  5. Trả về JSON cho frontend                       │
└────────────────┬────────────────────────────────────┘
                 │
                 │ SQL Query
                 │ SELECT * FROM gis_data_maplayer;
                 │ SELECT * FROM vietnam_provinces;
                 ▼
┌─────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL + PostGIS)                    │
│  🗄️ Database: webgis_db                            │
│                                                      │
│  Các bảng quan trọng:                               │
│  ┌───────────────────────────────────────┐         │
│  │ gis_data_maplayer                     │         │
│  │ → Định nghĩa layers (mục lục)        │         │
│  └───────────────────────────────────────┘         │
│                ↓ trỏ đến                            │
│  ┌───────────────────────────────────────┐         │
│  │ vietnam_provinces                     │         │
│  │ → Dữ liệu tỉnh thành (geometry)      │         │
│  └───────────────────────────────────────┘         │
│  ┌───────────────────────────────────────┐         │
│  │ points_of_interest                    │         │
│  │ → Điểm quan tâm (trường, bệnh viện)  │         │
│  └───────────────────────────────────────┘         │
│  ┌───────────────────────────────────────┐         │
│  │ routes                                │         │
│  │ → Tuyến đường (bus, metro)           │         │
│  └───────────────────────────────────────┘         │
│  ┌───────────────────────────────────────┐         │
│  │ boundaries                            │         │
│  │ → Ranh giới (quận, huyện)            │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Quy Trình Hiển Thị Layer

### 1️⃣ Khi người dùng mở web

```
User mở http://localhost:3000
    ↓
Frontend gọi API: GET /api/v1/layers/
    ↓
Backend query: SELECT * FROM gis_data_maplayer WHERE is_active = true;
    ↓
Backend trả về JSON:
{
    "results": [
        {"id": 1, "name": "Tỉnh thành VN", "data_source_table": "vietnam_provinces"},
        {"id": 2, "name": "Điểm quan tâm", "data_source_table": "points_of_interest"}
    ]
}
    ↓
Frontend hiển thị checkboxes:
☐ Tỉnh thành VN
☐ Điểm quan tâm
```

---

### 2️⃣ Khi người dùng tick checkbox "Tỉnh thành VN"

```
User tick ☑ Tỉnh thành VN
    ↓
Frontend gọi API: GET /api/v1/layers/1/features/
    ↓
Backend:
  1. Tìm layer id=1 trong gis_data_maplayer
  2. Đọc data_source_table = "vietnam_provinces"
  3. Query: SELECT id, name, code, ST_AsGeoJSON(geometry) FROM vietnam_provinces;
  4. Convert → GeoJSON FeatureCollection
    ↓
Backend trả về GeoJSON:
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Hà Nội", "code": "HN"},
            "geometry": {"type": "MultiPolygon", "coordinates": [...]}
        },
        ...
    ]
}
    ↓
Frontend:
  1. Nhận GeoJSON
  2. Apply styling (màu sắc, border...)
  3. Vẽ lên bản đồ bằng Leaflet
    ↓
User thấy layer hiển thị trên bản đồ! ✅
```

---

## 📋 Vai Trò Từng Bảng

### 🗂️ **gis_data_maplayer** - Bảng "Mục Lục"

**Vai trò:** Đây là "danh sách" các layer. Frontend đọc bảng này để biết có layer nào.

**Ví dụ:**
| id | name | data_source_table | geom_type |
|----|------|------------------|-----------|
| 1 | Tỉnh thành VN | vietnam_provinces | MULTIPOLYGON |
| 2 | Điểm quan tâm | points_of_interest | POINT |
| 3 | Tuyến đường | routes | LINESTRING |

**Khi nào sửa bảng này?**
- ✅ Khi thêm layer mới (VD: "Trường học")
- ✅ Khi bật/tắt layer (`is_active`)
- ❌ KHÔNG sửa khi chỉ thêm dữ liệu

---

### 🗺️ **vietnam_provinces** - Dữ Liệu Tỉnh Thành

**Vai trò:** Chứa dữ liệu thực tế (tên, geometry).

**Cấu trúc:**
```sql
CREATE TABLE vietnam_provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),        -- Tên tỉnh
    code VARCHAR(10),         -- Mã tỉnh (HN, HCM...)
    population INTEGER,       -- Dân số
    geometry MULTIPOLYGON     -- Ranh giới tỉnh
);
```

**Khi nào sửa bảng này?**
- ✅ Khi thêm tỉnh mới
- ✅ Khi cập nhật thông tin tỉnh
- ✅ Khi sửa ranh giới (geometry)

---

### 📍 **points_of_interest** - Điểm Quan Tâm

**Vai trò:** Lưu các điểm (trường học, bệnh viện, hồ, chợ...)

**Cấu trúc:**
```sql
CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),    -- Phân loại: Trường, BV...
    geometry POINT            -- Tọa độ điểm
);
```

---

### 📏 **routes** - Tuyến Đường

**Vai trò:** Lưu đường nối (bus, metro, highway...)

**Cấu trúc:**
```sql
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(100),        -- Bus, Metro...
    geometry LINESTRING       -- Đường nối
);
```

---

### 📐 **boundaries** - Ranh Giới

**Vai trò:** Lưu vùng (quận, huyện, khu bảo tồn...)

**Cấu trúc:**
```sql
CREATE TABLE boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(100),        -- District, Province...
    geometry MULTIPOLYGON     -- Vùng
);
```

---

## 🔧 Backend Code - Xử Lý Layers

### File: `apps/gis_data/views.py`

```python
class MapLayerViewSet(viewsets.ReadOnlyModelViewSet):
    # Trả về danh sách layers
    def list(self, request):
        layers = MapLayer.objects.filter(is_active=True)
        return Response(layers)

    # Trả về GeoJSON features của layer
    @action(detail=True, methods=['get'])
    def features(self, request, pk=None):
        layer = self.get_object()

        # Custom tables (không có Django model)
        if layer.data_source_table in ['points_of_interest', 'routes', 'boundaries']:
            # Query trực tiếp bằng raw SQL
            query = f"""
                SELECT json_build_object(
                    'type', 'FeatureCollection',
                    'features', json_agg(
                        json_build_object(
                            'type', 'Feature',
                            'properties', json_build_object('id', id, 'name', name),
                            'geometry', ST_AsGeoJSON(geometry)::json
                        )
                    )
                ) FROM {layer.data_source_table};
            """
            cursor.execute(query)
            return Response(cursor.fetchone()[0])

        # vietnam_provinces (có Django model)
        queryset = VietnamProvince.objects.all()
        serializer = VietnamProvinceGeoSerializer(queryset, many=True)
        return Response(serializer.data)
```

**Điều này có nghĩa:**
- ✅ Có thể thêm bảng GIS mới KHÔNG CẦN Django model
- ✅ Backend tự động query bằng raw SQL
- ✅ Chỉ cần thêm tên bảng vào `custom_tables` list

---

## 🎨 Frontend Code - Hiển Thị Bản Đồ

### File: `frontend/src/pages/MapViewer.jsx`

```javascript
function MapViewer() {
    const [layers, setLayers] = useState([]);
    const [selectedLayers, setSelectedLayers] = useState({});
    const [layerData, setLayerData] = useState({});

    // Load danh sách layers khi component mount
    useEffect(() => {
        gisAPI.listLayers().then(response => {
            setLayers(response.data.results);
        });
    }, []);

    // Khi user tick checkbox
    const handleLayerToggle = async (layerId) => {
        if (!layerData[layerId]) {
            // Fetch GeoJSON
            const response = await gisAPI.getFeatures(layerId);
            setLayerData({ ...layerData, [layerId]: response.data });
        }
        setSelectedLayers({ ...selectedLayers, [layerId]: true });
    };

    // Styling - TẤT CẢ layer cùng màu!
    const getLayerStyle = (feature) => ({
        fillColor: '#3498db',    // Xanh dương
        weight: 2,
        color: '#2980b9',
        fillOpacity: 0.3,
    });

    return (
        <MapContainer center={[16.0, 108.0]} zoom={6}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Hiển thị layers đã chọn */}
            {Object.entries(selectedLayers).map(([layerId, isSelected]) => {
                if (isSelected && layerData[layerId]) {
                    return (
                        <GeoJSON
                            key={layerId}
                            data={layerData[layerId]}
                            style={getLayerStyle}
                        />
                    );
                }
            })}
        </MapContainer>
    );
}
```

---

## 🛠️ Tools (Buffer, Intersect) - KHÔNG CẦN DATABASE!

**Câu trả lời ngắn gọn:** Tools là **API endpoints**, không lưu trong database.

### File: `apps/tools/views.py`

```python
class BufferToolViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def execute(self, request):
        # Nhận GeoJSON từ frontend
        input_geojson = request.data.get('input_geojson')
        distance = request.data.get('parameters', {}).get('distance', 1000)

        # Parse GeoJSON
        geometry = GEOSGeometry(json.dumps(input_geojson['geometry']))

        # Tính buffer
        buffered = geometry.buffer(distance / 111320)  # Convert to degrees

        # Trả về kết quả
        return Response({
            'result': json.loads(buffered.geojson)
        })
```

**Quy trình:**
```
User vẽ hình trên bản đồ
    ↓
Frontend gửi GeoJSON: POST /api/v1/tools/buffer/execute/
    ↓
Backend tính toán buffer
    ↓
Backend trả về GeoJSON kết quả
    ↓
Frontend hiển thị kết quả trên bản đồ
```

---

## ❓ Câu Hỏi Thường Gặp

### ❓ Tôi muốn thêm layer mới, cần làm gì?

**Trả lời:** 3 bước:
1. Tạo bảng GIS mới (VD: `schools`)
2. Thêm dữ liệu vào bảng
3. Đăng ký layer vào `gis_data_maplayer`

➡️ Xem chi tiết: [HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md)

---

### ❓ Tôi muốn styling (mỗi tỉnh màu khác), làm sao?

**Trả lời:** Cần sửa frontend:

**Cách 1:** Lưu màu trong database
```sql
ALTER TABLE vietnam_provinces ADD COLUMN color VARCHAR(7);
UPDATE vietnam_provinces SET color = '#FF6B6B' WHERE code = 'HN';
```

**Cách 2:** Sửa `getLayerStyle()` trong frontend
```javascript
const getLayerStyle = (feature) => {
    const color = feature.properties.color || '#3498db';
    return { fillColor: color, ... };
};
```

➡️ Xem chi tiết: [HUONG_DAN_THEM_LAYER_MOI.md](HUONG_DAN_THEM_LAYER_MOI.md) (phần Styling)

---

### ❓ Tôi muốn thêm tool mới (VD: Calculate Area), làm sao?

**Trả lời:** Tạo API endpoint mới:

1. Thêm vào `apps/tools/views.py`:
```python
@action(detail=False, methods=['post'])
def calculate_area(self, request):
    geometry = GEOSGeometry(...)
    area = geometry.area
    return Response({'area': area})
```

2. Thêm vào frontend (nút + logic gọi API)

➡️ KHÔNG CẦN thêm vào database!

---

### ❓ Làm sao kiểm tra ngay sau khi thêm dữ liệu?

**Trả lời:**

**Bước 1:** Kiểm tra database (pgAdmin)
```sql
SELECT * FROM gis_data_maplayer;
SELECT * FROM your_table;
```

**Bước 2:** Kiểm tra API
```bash
curl http://localhost:8080/api/v1/layers/
curl http://localhost:8080/api/v1/layers/4/features/
```

**Bước 3:** Kiểm tra web
1. Refresh trang (Ctrl+F5)
2. Click 🗺️
3. Tick checkbox layer mới
4. ✅ Xem dữ liệu!

---

## 📖 Tài Liệu Liên Quan

- **[Hướng Dẫn Thêm Layer Mới](HUONG_DAN_THEM_LAYER_MOI.md)** - Chi tiết từng bước
- **[Cheat Sheet](CHEAT_SHEET_THEM_LAYER.md)** - Copy & paste nhanh
- **[Setup Cho Bạn Bè](SETUP_CHO_BAN_BE.md)** - Hướng dẫn clone & setup

---

**Bây giờ bạn đã hiểu toàn bộ kiến trúc hệ thống! 🎉**
