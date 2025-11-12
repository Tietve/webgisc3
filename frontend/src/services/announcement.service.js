import api from './api'

const ANNOUNCEMENTS_BASE_URL = '/classrooms'

export const announcementService = {
  /**
   * List all announcements for a classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise} Array of announcements
   */
  list: async (classroomId) => {
    const response = await api.get(`${ANNOUNCEMENTS_BASE_URL}/${classroomId}/announcements/`)
    return response.data
  },

  /**
   * Create a new announcement
   * @param {number} classroomId - Classroom ID
   * @param {string} content - Announcement content
   * @returns {Promise} Created announcement
   */
  create: async (classroomId, content) => {
    const response = await api.post(`${ANNOUNCEMENTS_BASE_URL}/${classroomId}/announcements/`, {
      content
    })
    return response.data
  },

  /**
   * Update an announcement
   * @param {number} classroomId - Classroom ID
   * @param {number} announcementId - Announcement ID
   * @param {string} content - Updated content
   * @returns {Promise} Updated announcement
   */
  update: async (classroomId, announcementId, content) => {
    const response = await api.patch(
      `${ANNOUNCEMENTS_BASE_URL}/${classroomId}/announcements/${announcementId}/`,
      { content }
    )
    return response.data
  },

  /**
   * Delete an announcement
   * @param {number} classroomId - Classroom ID
   * @param {number} announcementId - Announcement ID
   * @returns {Promise}
   */
  delete: async (classroomId, announcementId) => {
    const response = await api.delete(
      `${ANNOUNCEMENTS_BASE_URL}/${classroomId}/announcements/${announcementId}/`
    )
    return response.data
  }
}
