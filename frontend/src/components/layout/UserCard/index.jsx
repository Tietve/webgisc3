import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants'
import { getInitials, truncate } from '@utils'

const UserCard = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <div className="glass rounded-lg p-4 min-w-[200px] animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-semibold">
            {getInitials(user?.email)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {truncate(user?.email, 20)}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <Link
              to={ROUTES.DASHBOARD}
              className="block text-sm text-gray-700 hover:text-accent"
            >
              → Dashboard
            </Link>
            <Link
              to={ROUTES.CLASSROOMS}
              className="block text-sm text-gray-700 hover:text-accent"
            >
              → Lớp học
            </Link>
            <button
              onClick={onLogout}
              className="block w-full text-left text-sm text-red-600 hover:text-red-700"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCard
