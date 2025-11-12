import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants'
import { getInitials } from '@utils'

const CollapsibleSidebar = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: ROUTES.DASHBOARD },
    { icon: '🏫', label: 'Classrooms', path: ROUTES.CLASSROOMS },
    { icon: '🌍', label: 'Map Viewer', path: ROUTES.MAP },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside
      className={`flex h-screen flex-col justify-between bg-[#111827] text-gray-300 sticky top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8 p-4">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <span className="text-3xl text-blue-400">🌍</span>
            {!isCollapsed && (
              <h1 className="text-white text-xl font-bold tracking-tighter">WebGIS</h1>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Thu gọn"
            >
              ◀
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center w-full px-3 py-2 text-gray-400 hover:text-white transition-colors"
            title="Mở rộng"
          >
            ▶
          </button>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-blue-500/20 text-white font-bold transform hover:scale-105'
                  : 'hover:bg-white/10 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <p className="text-sm">{item.label}</p>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section - User */}
      <div className={`flex flex-col gap-4 p-4 ${isCollapsed ? 'items-center' : ''}`}>
        {/* User Info */}
        <div className={`flex items-center gap-3 border-t border-gray-700 pt-4 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white flex-shrink-0">
            {getInitials(user?.email)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <p className="text-white text-sm font-semibold leading-normal truncate max-w-[140px]">
                {user?.email}
              </p>
              <span className="text-xs font-semibold uppercase tracking-wider bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 w-fit">
                {user?.role || 'User'}
              </span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-center'
          }`}
          title={isCollapsed ? 'Đăng xuất' : ''}
        >
          <span className="text-xl">🚪</span>
          {!isCollapsed && <p className="text-sm font-medium">Đăng xuất</p>}
        </button>
      </div>
    </aside>
  )
}

export default CollapsibleSidebar
