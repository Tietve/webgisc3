import api from './api'
import { ENDPOINTS } from '@constants'

/**
 * Deadline Service
 * Handles aggregated deadlines from assignments and quizzes
 */
const deadlineService = {
  /**
   * Get all deadlines (assignments + quizzes) with optional filters
   * @param {Object} filters - Optional filters { status: 'upcoming' | 'due_soon' | 'overdue', classroom_id, type }
   * @returns {Promise} Deadlines list
   */
  async getAll(filters = {}) {
    const response = await api.get(ENDPOINTS.DEADLINES.LIST, { params: filters })
    return response.data
  },

  /**
   * Get upcoming deadlines for current user
   * @returns {Promise} Upcoming deadlines
   */
  async getUpcoming() {
    const response = await api.get(ENDPOINTS.DEADLINES.LIST, {
      params: { status: 'upcoming', limit: 10 }
    })
    return response.data
  },

  /**
   * Get due soon deadlines (within 48 hours)
   * @returns {Promise} Due soon deadlines
   */
  async getDueSoon() {
    const response = await api.get(ENDPOINTS.DEADLINES.LIST, {
      params: { status: 'due_soon' }
    })
    return response.data
  },

  /**
   * Get overdue deadlines
   * @returns {Promise} Overdue deadlines
   */
  async getOverdue() {
    const response = await api.get(ENDPOINTS.DEADLINES.LIST, {
      params: { status: 'overdue' }
    })
    return response.data
  },

  /**
   * Get deadlines for a specific classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise} Classroom deadlines
   */
  async getByClassroom(classroomId) {
    const response = await api.get(ENDPOINTS.DEADLINES.LIST, {
      params: { classroom_id: classroomId }
    })
    return response.data
  }
}

export default deadlineService
