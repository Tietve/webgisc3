import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@services'
import { authStorage } from '@utils'
import { ROUTES } from '@constants'

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = authStorage.getUser()
      if (storedUser) {
        setUser(storedUser)
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      // Call login API
      const data = await authService.login(email, password)

      // Store token
      authStorage.setToken(data.access)

      // Fetch and store user profile
      const userProfile = await authService.getProfile()
      setUser(userProfile)
      authStorage.setUser(userProfile)

      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Đăng nhập thất bại',
      }
    }
  }

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      await authService.register(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Đăng ký thất bại',
      }
    }
  }

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout()
    setUser(null)
    navigate(ROUTES.LOGIN)
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user && !!authStorage.getToken()
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return user?.role === role
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  }
}
