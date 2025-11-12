import api from './api'
import { ENDPOINTS } from '@constants'

const quizService = {
  async list() {
    const response = await api.get(ENDPOINTS.QUIZZES.LIST)
    return response.data
  },

  async get(id) {
    const response = await api.get(ENDPOINTS.QUIZZES.DETAIL(id))
    return response.data
  },

  async getSession(classId, quizId) {
    const response = await api.get(ENDPOINTS.QUIZZES.SESSION(classId, quizId))
    return response.data
  },

  async submit(quizId, answers) {
    const response = await api.post(ENDPOINTS.QUIZZES.SUBMIT, {
      quiz_id: quizId,
      answers,
    })
    return response.data
  },
}

export default quizService
