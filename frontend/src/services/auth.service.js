import api from './api'
import { ENDPOINTS } from '@constants'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise} Token response
   */
  async login(email, password) {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password })
    return response.data
  },

  /**
   * Register new user
   * @param {Object} userData - { email, password, password_confirm, role }
   * @returns {Promise}
   */
  async register(userData) {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  },

  /**
   * Get current user profile
   * @returns {Promise} User data
   */
  async getProfile() {
    const response = await api.get(ENDPOINTS.AUTH.PROFILE)
    return response.data
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise} New token
   */
  async refreshToken(refreshToken) {
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refresh: refreshToken })
    return response.data
  },

  /**
   * Logout - Clear local storage
   */
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
}

export default authService
