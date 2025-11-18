# ✨ Tính Năng Popup Chi Tiết Cho Map Layers

## 🎯 Tổng Quan

Đã thêm tính năng **click vào điểm trên bản đồ để xem thông tin chi tiết** với popup.

### Tính Năng

- ✅ **Hover Effect**: Con trỏ chuột chuyển thành pointer khi di chuột qua feature
- ✅ **Click to View**: Click vào feature để hiển thị popup
- ✅ **Auto Format**: Tự động format tên trường (category → Category)
- ✅ **All Geometry Types**: Hoạt động với Point, LineString, Polygon

---

## 🖱️ Cách Sử Dụng

### Bước 1: Bật Layer
1. Mở http://localhost:7749
2. Click nút **"Layers"** trên toolbar
3. Chọn checkbox bất kỳ layer nào (ví dụ: "Bệnh viện")

### Bước 2: Xem Thông Tin
1. **Di chuột** qua điểm trên map → Con trỏ chuyển thành 👆 pointer
2. **Click vào điểm** → Popup hiển thị thông tin chi tiết
3. **Click X** hoặc click nơi khác để đóng popup

---

## 📋 Thông Tin Hiển Thị

Popup tự động hiển thị:

### Point Features (Điểm)
```
━━━━━━━━━━━━━━━━━━━
  Bệnh viện Bạch Mai
━━━━━━━━━━━━━━━━━━━
Category: Bệnh viện
Description: ...
━━━━━━━━━━━━━━━━━━━
```

### LineString Features (Đường)
```
━━━━━━━━━━━━━━━━━━━
  Tuyến Bus 01
━━━━━━━━━━━━━━━━━━━
Type: Bus
Length km: 12.5
━━━━━━━━━━━━━━━━━━━
```

### Polygon Features (Vùng)
```
━━━━━━━━━━━━━━━━━━━
  Quận Hoàn Kiếm
━━━━━━━━━━━━━━━━━━━
Province: Hà Nội
Population: 150,000
━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Chi Tiết Kỹ Thuật

### Files Đã Cập Nhật

1. **MapboxMap/index.jsx**
   - Thêm `addClickHandler()` method
   - Thêm `removeClickHandler()` method
   - Thêm `showPopup()` method
   - Cursor change on hover

2. **MapViewerPage.jsx**
   - Add click handlers cho Points
   - Add click handlers cho LineStrings
   - Add click handlers cho Polygons
   - Cleanup handlers khi remove layer

### Code Example

```javascript
// Add click handler
mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
  const properties = feature.properties

  let popupHTML = '<div style="padding: 8px;">'
  popupHTML += `<h3>${properties.name}</h3>`
  popupHTML += `<p>Category: ${properties.category}</p>`
  popupHTML += '</div>'

  mapRef.current.showPopup(coordinates, popupHTML)
})

// Remove handler when layer is disabled
mapRef.current.removeClickHandler(`layer-${layerId}`)
```

---

## 🎨 Popup Styling

### Current Style
- **Background**: White
- **Max Width**: 250px
- **Padding**: 8px
- **Title**: Bold, 14px, #1f1f1f
- **Content**: Regular, 12px, #5f6368

### Customize Popup

Edit in `MapViewerPage.jsx`:

```javascript
let popupHTML = '<div style="padding: 12px; background: #f8f9fa;">'
popupHTML += `<h3 style="color: #34a853;">${properties.name}</h3>`
// ... customize more
```

---

## 🧪 Testing

### Test với Sample Data

1. **Thêm điểm test vào database:**

```sql
INSERT INTO points_of_interest (name, category, description, geometry)
VALUES (
    'Test Hospital',
    'Bệnh viện',
    'This is a test point with detailed info',
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[105.8342,21.0278]}')
);
```

2. **Tạo layer trong Django Admin:**
   - Name: "Test Layer"
   - Data source: points_of_interest
   - Filter column: category
   - Filter value: Bệnh viện

3. **Kiểm tra:**
   - Bật layer trong frontend
   - Click vào điểm
   - Popup hiển thị:
     - Name: Test Hospital
     - Category: Bệnh viện
     - Description: This is a test point...

---

## 🚀 Tính Năng Nâng Cao

### 1. Hover Highlight

Có thể thêm highlight khi hover:

```javascript
map.on('mouseenter', layerId, () => {
  map.setPaintProperty(layerId, 'circle-radius', 8)
  map.setPaintProperty(layerId, 'circle-color', '#ea4335')
})

map.on('mouseleave', layerId, () => {
  map.setPaintProperty(layerId, 'circle-radius', 6)
  map.setPaintProperty(layerId, 'circle-color', '#34a853')
})
```

### 2. Rich Popup Content

Thêm hình ảnh, links, buttons:

```javascript
let popupHTML = `
  <div style="padding: 12px;">
    <img src="${properties.image_url}" style="width: 100%; border-radius: 8px;">
    <h3>${properties.name}</h3>
    <p>${properties.description}</p>
    <a href="${properties.website}" target="_blank">Visit Website</a>
  </div>
`
```

### 3. Popup Actions

Thêm buttons để thực hiện actions:

```javascript
let popupHTML = `
  <div style="padding: 12px;">
    <h3>${properties.name}</h3>
    <button onclick="getDirections(${coordinates})">Get Directions</button>
    <button onclick="viewDetails(${properties.id})">View Details</button>
  </div>
`
```

---

## 📊 Popup với Geometry Types

| Geometry Type | Coordinates Used | Best Practice |
|---------------|------------------|---------------|
| Point | Exact point | Use feature coordinates |
| LineString | First point | Use midpoint for better UX |
| Polygon | First corner | Use centroid for better UX |

### Cải Thiện Polygon Popups

```javascript
// Calculate centroid
import * as turf from '@turf/turf'

const center = turf.centroid(feature)
const coordinates = center.geometry.coordinates

mapRef.current.showPopup(coordinates, popupHTML)
```

---

## ✅ Checklist

- [x] Cursor changes to pointer on hover
- [x] Click shows popup
- [x] Popup displays all properties
- [x] Works with Points
- [x] Works with LineStrings
- [x] Works with Polygons
- [x] Handlers removed when layer disabled
- [x] No memory leaks
- [x] No console errors

---

## 🐛 Troubleshooting

### Popup không hiển thị?

1. **Check console errors** (F12)
2. **Verify layer has data:**
   ```bash
   curl http://localhost:8080/api/v1/layers/{ID}/features/
   ```
3. **Check feature properties:**
   - Phải có `name` field
   - Properties không được null

### Cursor không đổi?

```javascript
// Check layer ID matches
console.log('Layer ID:', `layer-${layerId}`)
```

### Popup vị trí sai?

```javascript
// For polygons, use centroid
import * as turf from '@turf/turf'
const centroid = turf.centroid(feature)
const coords = centroid.geometry.coordinates
```

---

## 📝 Summary

✅ **Đã hoàn thành:**
- Cursor pointer on hover
- Click to show popup
- Auto format property labels
- Support all geometry types
- Cleanup on layer removal

🎯 **Cách sử dụng:**
1. Bật layer trong Layers panel
2. Di chuột qua feature → cursor pointer
3. Click → popup hiển thị thông tin

**Hoàn toàn hoạt động với API backend, không hardcode!** 🎉

---

Generated: 2025-01-18
Feature: Interactive Popups for Map Layers
