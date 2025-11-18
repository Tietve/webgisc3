import api from './api'
import { ENDPOINTS } from '@constants'

/**
 * Assignment Service
 * Handles all assignment-related API calls
 */
const assignmentService = {
  /**
   * Get list of assignments for a classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise} Assignments list
   */
  async list(classroomId) {
    const response = await api.get(ENDPOINTS.ASSIGNMENTS.LIST(classroomId))
    return response.data
  },

  /**
   * Get assignment details
   * @param {number} id - Assignment ID
   * @returns {Promise} Assignment details
   */
  async get(id) {
    const response = await api.get(ENDPOINTS.ASSIGNMENTS.DETAIL(id))
    return response.data
  },

  /**
   * Create new assignment (teachers only)
   * @param {number} classroomId - Classroom ID
   * @param {FormData} formData - Assignment data (title, description, due_date, max_score, attachment)
   * @returns {Promise} Created assignment
   */
  async create(classroomId, formData) {
    const response = await api.post(ENDPOINTS.ASSIGNMENTS.CREATE(classroomId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Update assignment (teachers only)
   * @param {number} id - Assignment ID
   * @param {FormData} formData - Updated data
   * @returns {Promise} Updated assignment
   */
  async update(id, formData) {
    const response = await api.put(ENDPOINTS.ASSIGNMENTS.DETAIL(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Delete assignment (teachers only)
   * @param {number} id - Assignment ID
   * @returns {Promise}
   */
  async delete(id) {
    const response = await api.delete(ENDPOINTS.ASSIGNMENTS.DETAIL(id))
    return response.data
  },

  /**
   * Get submissions for an assignment (teachers only)
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise} Submissions list
   */
  async getSubmissions(assignmentId) {
    const response = await api.get(ENDPOINTS.ASSIGNMENTS.SUBMISSIONS(assignmentId))
    return response.data
  }
}

export default assignmentService
