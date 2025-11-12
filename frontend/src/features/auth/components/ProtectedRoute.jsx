import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks'
import { ROUTES } from '@constants'
import { Spinner } from '@components/common'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return children
}

export default ProtectedRoute
