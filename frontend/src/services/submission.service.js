import api from './api'
import { ENDPOINTS } from '@constants'

/**
 * Submission Service
 * Handles all submission-related API calls
 */
const submissionService = {
  /**
   * Submit assignment (students)
   * @param {number} assignmentId - Assignment ID
   * @param {FormData} formData - Submission data (text_answer, file_submission)
   * @returns {Promise} Created submission
   */
  async submit(assignmentId, formData) {
    const response = await api.post(ENDPOINTS.SUBMISSIONS.CREATE(assignmentId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Get submission details
   * @param {number} id - Submission ID
   * @returns {Promise} Submission details
   */
  async get(id) {
    const response = await api.get(ENDPOINTS.SUBMISSIONS.DETAIL(id))
    return response.data
  },

  /**
   * Update submission (students, before deadline)
   * @param {number} id - Submission ID
   * @param {FormData} formData - Updated data
   * @returns {Promise} Updated submission
   */
  async update(id, formData) {
    const response = await api.put(ENDPOINTS.SUBMISSIONS.DETAIL(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Delete submission (students, before grading)
   * @param {number} id - Submission ID
   * @returns {Promise}
   */
  async delete(id) {
    const response = await api.delete(ENDPOINTS.SUBMISSIONS.DETAIL(id))
    return response.data
  },

  /**
   * Grade submission (teachers only)
   * @param {number} id - Submission ID
   * @param {Object} data - Grade data { score, feedback }
   * @returns {Promise} Updated submission with grade
   */
  async grade(id, data) {
    const response = await api.post(ENDPOINTS.SUBMISSIONS.GRADE(id), data)
    return response.data
  },

  /**
   * Get student's submissions for a classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise} Student's submissions list
   */
  async getMySubmissions(classroomId) {
    const response = await api.get(ENDPOINTS.SUBMISSIONS.MY_SUBMISSIONS(classroomId))
    return response.data
  }
}

export default submissionService
