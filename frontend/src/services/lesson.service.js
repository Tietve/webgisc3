import api from './api'
import { ENDPOINTS } from '@constants'

const lessonService = {
  async list(filters = {}) {
    const response = await api.get(ENDPOINTS.LESSONS.LIST, { params: filters })
    return response.data
  },

  async get(id) {
    const response = await api.get(ENDPOINTS.LESSONS.DETAIL(id))
    return response.data
  },

  async getProgress(id, classroomId) {
    const response = await api.get(ENDPOINTS.LESSONS.PROGRESS(id), {
      params: { classroom_id: classroomId },
    })
    return response.data
  },

  async saveProgress(id, payload) {
    const response = await api.post(ENDPOINTS.LESSONS.PROGRESS(id), payload)
    return response.data
  },
}

export default lessonService
