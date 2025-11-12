import api from './api'
import { ENDPOINTS } from '@constants'

const lessonService = {
  async list() {
    const response = await api.get(ENDPOINTS.LESSONS.LIST)
    return response.data
  },

  async get(id) {
    const response = await api.get(ENDPOINTS.LESSONS.DETAIL(id))
    return response.data
  },
}

export default lessonService
