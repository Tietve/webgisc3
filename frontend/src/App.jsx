import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@constants'

// Auth
import LoginPage from '@features/auth/pages/LoginPage'
import ProtectedRoute from '@features/auth/components/ProtectedRoute'

// Dashboard
import DashboardPage from '@features/dashboard/pages/DashboardPage'

// Map
import MapViewerPage from '@features/map/pages/MapViewerPage'

// Classrooms
import ClassroomsPage from '@features/classroom/pages/ClassroomsPage'
import ClassroomDetailPage from '@features/classroom/pages/ClassroomDetailPage'

// Placeholder pages (will be implemented later)
const LessonViewerPage = () => <div>Lesson Viewer - Coming Soon</div>
const QuizTakerPage = () => <div>Quiz Taker - Coming Soon</div>
const ToolsPage = () => <div>Tools Page - Coming Soon</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.CLASSROOMS}
          element={
            <ProtectedRoute>
              <ClassroomsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classrooms/:id"
          element={
            <ProtectedRoute>
              <ClassroomDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MAP}
          element={
            <ProtectedRoute>
              <MapViewerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.LESSON}
          element={
            <ProtectedRoute>
              <LessonViewerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.QUIZ}
          element={
            <ProtectedRoute>
              <QuizTakerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.TOOLS}
          element={
            <ProtectedRoute>
              <ToolsPage />
            </ProtectedRoute>
          }
        />

        {/* Root - Redirect to Dashboard or Login */}
        <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
