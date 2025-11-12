# 🚀 Migration Guide - Frontend v1 → v2

## ✅ Hoàn thành

Frontend mới đã được xây dựng hoàn chỉnh với **Hybrid Architecture**!

### 📦 Đã tạo:

1. ✅ **Project Setup**
   - Vite + React 18 + Tailwind CSS
   - Cấu hình path aliases (@components, @features, @hooks...)
   - ESLint + PostCSS + Tailwind config

2. ✅ **Folder Structure** (Hybrid Architecture)
   - `src/components/` - Shared components (Button, Card, Modal...)
   - `src/features/` - Feature modules (auth, dashboard, map...)
   - `src/layouts/` - Layout wrappers
   - `src/hooks/` - Custom React hooks
   - `src/services/` - API services layer
   - `src/utils/` - Utility functions
   - `src/constants/` - Constants & configuration

3. ✅ **Core Infrastructure**
   - Constants (API endpoints, routes, map config, roles)
   - Services (auth, classroom, lesson, quiz, gis, tools)
   - Utils (storage, validators, formatters, geoHelpers)
   - Hooks (useAuth, useApi)

4. ✅ **UI Components**
   - Button (4 variants)
   - Card (with header/title/content)
   - Input (with icons & validation)
   - Badge (3 variants)
   - Modal (responsive sizes)
   - Spinner (3 sizes)

5. ✅ **Layouts**
   - MainLayout (with Sidebar)
   - MapLayout (full-screen with UserCard)
   - AuthLayout (split-screen)

6. ✅ **Features**
   - **Auth**: Login, Register pages + ProtectedRoute
   - **Dashboard**: Stats cards + Quick links
   - **Map**: Basic Leaflet map with toolbar & panels

7. ✅ **Routing**
   - React Router v6 setup
   - Protected routes
   - Root redirect logic

---

## 🚀 Cách sử dụng

### 1. Chạy Development Server

```bash
cd frontend_new
npm run dev
```

Server sẽ chạy tại: **http://localhost:3001** (hoặc port khác nếu 3000 bị dùng)

### 2. Test Login

Mở browser → http://localhost:3001

Demo accounts:
- Admin: `admin@webgis.com` / `admin123`
- Teacher: `teacher01@webgis.com` / `teacher123`
- Student: `student01@webgis.com` / `student123`

### 3. Build Production

```bash
npm run build
npm run preview
```

---

## 📂 So sánh cấu trúc

### ❌ Frontend cũ (frontend/):
```
src/
├── api/api.js              # Tất cả API logic
├── pages/                  # Pages chứa cả logic + UI
└── styles/index.css        # Tất cả CSS
```

### ✅ Frontend mới (frontend_new/):
```
src/
├── components/common/      # Shared components
├── features/               # Feature modules
│   ├── auth/              # Login, Register
│   ├── dashboard/         # Dashboard
│   ├── map/               # Map viewer
│   └── ...
├── layouts/               # Layout wrappers
├── hooks/                 # Custom hooks
├── services/              # API services (tách riêng)
├── utils/                 # Utilities
└── constants/             # Constants
```

---

## 🎯 Lợi ích

### 1. **Tái sử dụng code**
```jsx
// Trước: Lặp code button nhiều nơi
// Sau: Import component
import { Button } from '@components/common'
<Button variant="primary">Click me</Button>
```

### 2. **Dễ bảo trì**
```jsx
// Trước: MapViewer.jsx (1000+ lines)
// Sau: Tách nhỏ
<MapViewerPage>
  <MapContainer />
  <LayersPanel />
  <ToolsPanel />
  <LessonsPanel />
</MapViewerPage>
```

### 3. **Testing dễ hơn**
```javascript
// Test từng component nhỏ
test('Button renders correctly', ...)
test('useAuth hook handles login', ...)
```

### 4. **Team collaboration**
- Dev A: làm `features/map/`
- Dev B: làm `features/quiz/`
- Không conflict!

---

## 🔧 Tiếp theo cần làm gì?

### Phase 2: Hoàn thiện features

1. **Classroom Feature**
   - Tạo `features/classroom/pages/ClassroomsPage.jsx`
   - Components: CreateClassroomForm, ClassroomTable, StudentsModal

2. **Map Feature** (Quan trọng!)
   - Tạo `features/map/components/LayersPanel/` với API integration
   - Tạo `features/map/components/ToolsPanel/` với drawing tools
   - Tạo `features/map/components/LessonsPanel/` với lesson modal
   - Hooks: `useMapLayers.js`, `useMapTools.js`

3. **Lesson Feature**
   - Tạo `features/lesson/pages/LessonViewerPage.jsx`
   - Components: LessonProgress, StepNavigation

4. **Quiz Feature**
   - Tạo `features/quiz/pages/QuizTakerPage.jsx`
   - Components: QuestionCard, AnswerOption, ScoreModal

---

## 📝 Code Examples

### Sử dụng Services:
```jsx
import { classroomService } from '@services'

const classrooms = await classroomService.list()
await classroomService.create('My Class')
```

### Sử dụng Hooks:
```jsx
import { useAuth } from '@hooks'

const { user, login, logout } = useAuth()
await login(email, password)
```

### Sử dụng Constants:
```jsx
import { ROUTES, API_BASE_URL } from '@constants'

navigate(ROUTES.DASHBOARD)
```

---

## 🎨 Tailwind CSS Classes

Các class utility đã định nghĩa sẵn:

```jsx
// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Cards
<div className="card">Content</div>
<div className="card-hover">Hoverable</div>

// Inputs
<input className="input" />

// Badges
<span className="badge-primary">Badge</span>

// Glassmorphism
<div className="glass">Transparent blur</div>

// Gradients
<div className="gradient-primary">Blue gradient</div>
<div className="gradient-accent">Purple gradient</div>
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@components/...'"

**Fix**: Restart dev server sau khi thay đổi vite.config.js

```bash
# Ctrl+C để stop server
npm run dev
```

### Lỗi: Leaflet marker không hiện

**Fix**: Đã fix sẵn trong MapViewerPage.jsx:

```jsx
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
// ... icon config
```

### Lỗi: CORS khi call API

**Fix**: Vite proxy đã config sẵn trong `vite.config.js`:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
}
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check terminal xem có errors không
2. Check browser console (F12)
3. Đọc README.md trong `frontend_new/`

---

## 🎉 Kết luận

Frontend mới đã:
- ✅ Cấu trúc khoa học (Hybrid Architecture)
- ✅ Dễ scale và maintain
- ✅ Tailwind CSS hiện đại
- ✅ Components tái sử dụng
- ✅ Type-safe với JSDoc
- ✅ Ready để phát triển tiếp!

**Next step**: Implement các features còn lại (Classroom, Quiz, Map tools...)

Good luck! 🚀
