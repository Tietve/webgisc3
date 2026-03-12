import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks'
import { ROUTES } from '@constants'
import { Spinner } from '@components/common'
import { authStorage } from '@utils'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const hasToken = Boolean(authStorage.getToken())

  if (loading || (hasToken && !user)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
