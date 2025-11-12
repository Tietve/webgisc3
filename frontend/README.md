# WebGIS Platform - Frontend v2.0

Modern React frontend for WebGIS Platform built with Vite, React 18, and Tailwind CSS.

## 🚀 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet

## 📁 Project Structure (Hybrid Architecture)

```
src/
├── assets/              # Static files (images, icons)
├── components/          # Shared components
│   ├── common/         # Reusable UI components
│   └── layout/         # Layout components (Sidebar, UserCard)
├── features/           # Feature modules
│   ├── auth/          # Authentication (Login, Register)
│   ├── dashboard/     # Dashboard
│   ├── map/           # Map viewer & tools
│   ├── classroom/     # Classroom management
│   ├── lesson/        # Lessons
│   └── quiz/          # Quizzes
├── layouts/            # Layout wrappers
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
├── constants/          # Constants & config
└── styles/             # Global styles
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

Create `.env.development` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_MAP_DEFAULT_CENTER_LAT=16.0
VITE_MAP_DEFAULT_CENTER_LNG=108.0
VITE_MAP_DEFAULT_ZOOM=6
```

## 📝 Features

- ✅ JWT Authentication
- ✅ Role-based access (Student/Teacher)
- ✅ Dashboard with stats
- ✅ Interactive Leaflet maps
- ✅ Classroom management
- ✅ Interactive lessons
- ✅ Quiz system
- ✅ GIS analysis tools
- ✅ Responsive design
- ✅ Tailwind CSS styling

## 🎨 Design System

### Colors
- Primary: Blue gradient (#1e3c72 → #2a5298)
- Accent: Purple (#667eea → #764ba2)
- Background: Light gray (#f5f7fa)

### Components
- Button (primary, secondary, danger, ghost)
- Card (with hover effects)
- Input (with icons & validation)
- Modal (with backdrop)
- Badge (primary, success, warning)
- Spinner (loading indicator)

## 🗺️ Map Features

- OpenStreetMap base layer
- Drawing tools (points, lines, polygons)
- Measurement tools (distance, area)
- Buffer analysis
- Layer management
- Interactive lessons on map

## 📚 Demo Accounts

- **Admin**: admin@webgis.com / admin123
- **Teacher**: teacher01@webgis.com / teacher123
- **Student**: student01@webgis.com / student123

## 🔧 Development

### File Naming
- Components: PascalCase (e.g., `Button.jsx`)
- Utilities: camelCase (e.g., `formatDate.js`)
- Constants: UPPER_SNAKE_CASE

### Import Aliases
- `@/` - src root
- `@components/` - components
- `@features/` - features
- `@layouts/` - layouts
- `@hooks/` - hooks
- `@services/` - services
- `@utils/` - utils
- `@constants/` - constants

## 📄 License

MIT
