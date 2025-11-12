import React from 'react'
import UserCard from '@components/layout/UserCard'
import { useAuth } from '@hooks'

const MapLayout = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {children}
      <UserCard user={user} onLogout={logout} />
    </div>
  )
}

export default MapLayout
