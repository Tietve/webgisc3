import React from 'react'
import Sidebar from '@components/layout/Sidebar'
import { useAuth } from '@hooks'

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

export default MainLayout
