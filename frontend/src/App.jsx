import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classrooms from './pages/Classrooms';
import LessonViewer from './pages/LessonViewer';
import QuizTaker from './pages/QuizTaker';
import MapViewer from './pages/MapViewer';
import Tools from './pages/Tools';
import { authAPI } from './api/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/classrooms"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Classrooms user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/lessons/:id"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <LessonViewer />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/quiz/:id"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <QuizTaker user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/map"
          element={
            user ? (
              <MapLayout user={user} onLogout={handleLogout}>
                <MapViewer />
              </MapLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/tools"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Tools />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

// Standard Layout với sidebar
function Layout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/classrooms', icon: '🏫', label: 'Classrooms' },
    { path: '/map', icon: '🗺️', label: 'Map Viewer' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '260px' : '70px',
        background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
        transition: 'width 0.3s ease',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          color: 'white',
          fontSize: sidebarOpen ? '20px' : '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
        }}>
          {sidebarOpen ? '🌍 WebGIS Platform' : '🌍'}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            right: '-15px',
            top: '30px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            zIndex: 101,
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '20px 10px' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                marginBottom: '5px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '30px' }}>{item.icon}</span>
              {sidebarOpen && <span style={{ marginLeft: '10px', fontSize: '15px' }}>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* User Info & Logout */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
        }}>
          {sidebarOpen ? (
            <>
              <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>
                {user.email}
              </div>
              <div style={{ fontSize: '12px', marginBottom: '15px', opacity: 0.6 }}>
                Role: {user.role}
              </div>
              <button
                onClick={onLogout}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: '#f5f7fa',
      }}>
        {children}
      </div>
    </div>
  );
}

// Map Layout - Full screen map với floating controls
function MapLayout({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Bottom-right floating controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
        {/* User Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '10px 15px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {user.email.split('@')[0]}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {user.role}
            </div>
          </div>
          {/* Menu Button integrated */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: '35px',
              height: '35px',
              borderRadius: '8px',
              border: 'none',
              background: menuOpen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(0,0,0,0.05)',
              color: menuOpen ? 'white' : '#333',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginLeft: '5px',
            }}
            onMouseEnter={(e) => !menuOpen && (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => !menuOpen && (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '10px',
          minWidth: '200px',
          animation: 'slideUp 0.3s ease',
        }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#333',
              transition: 'all 0.2s ease',
              marginBottom: '5px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ marginRight: '10px', fontSize: '18px' }}>📊</span>
            Dashboard
          </Link>
          <Link
            to="/classrooms"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#333',
              transition: 'all 0.2s ease',
              marginBottom: '5px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ marginRight: '10px', fontSize: '18px' }}>🏫</span>
            Classrooms
          </Link>
          <div style={{
            height: '1px',
            background: '#e0e0e0',
            margin: '5px 0',
          }} />
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#d32f2f',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#ffebee'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ marginRight: '10px', fontSize: '18px' }}>🚪</span>
            Logout
          </button>
        </div>
      )}

      {/* Map Content */}
      {children}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
