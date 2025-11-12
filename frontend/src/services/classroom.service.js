import api from './api'
import { ENDPOINTS } from '@constants'

/**
 * Classroom Service
 * Handles all classroom-related API calls
 */
const classroomService = {
  /**
   * Get list of classrooms
   * @returns {Promise} Classrooms list
   */
  async list() {
    const response = await api.get(ENDPOINTS.CLASSROOMS.LIST)
    return response.data
  },

  /**
   * Create new classroom (teachers only)
   * @param {string} name - Classroom name
   * @returns {Promise} Created classroom
   */
  async create(name) {
    const response = await api.post(ENDPOINTS.CLASSROOMS.CREATE, { name })
    return response.data
  },

  /**
   * Get classroom details
   * @param {number} id - Classroom ID
   * @returns {Promise} Classroom details
   */
  async get(id) {
    const response = await api.get(ENDPOINTS.CLASSROOMS.DETAIL(id))
    return response.data
  },

  /**
   * Get students in classroom (teachers only)
   * @param {number} id - Classroom ID
   * @returns {Promise} Students list
   */
  async getStudents(id) {
    const response = await api.get(ENDPOINTS.CLASSROOMS.STUDENTS(id))
    return response.data
  },

  /**
   * Join classroom with enrollment code (students only)
   * @param {string} enrollmentCode - 8-character code
   * @returns {Promise}
   */
  async join(enrollmentCode) {
    const response = await api.post(ENDPOINTS.CLASSROOMS.ENROLL, { enrollment_code: enrollmentCode })
    return response.data
  },
}

export default classroomService
