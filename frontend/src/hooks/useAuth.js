import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@services'
import { authStorage } from '@utils'
import { ROUTES } from '@constants'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const hydrateUser = useCallback(async () => {
    const storedUser = authStorage.getUser()
    const token = authStorage.getToken()

    if (storedUser) {
      setUser(storedUser)
    }

    if (!token) {
      setLoading(false)
      return
    }

    if (storedUser) {
      setLoading(false)
      return
    }

    try {
      const profile = await authService.getProfile()
      setUser(profile)
      authStorage.setUser(profile)
    } catch (error) {
      authService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateUser()
  }, [hydrateUser])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      authStorage.setToken(data.access)
      const userProfile = await authService.getProfile()
      setUser(userProfile)
      authStorage.setUser(userProfile)
      navigate(ROUTES.DASHBOARD)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Đăng nhập thất bại',
      }
    }
  }

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

  const logout = () => {
    authService.logout()
    setUser(null)
    navigate(ROUTES.LOGIN)
  }

  const isAuthenticated = () => !!authStorage.getToken() && !!user
  const hasRole = (role) => user?.role === role

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    refreshUser: hydrateUser,
  }
}
