import api from './api'
import { AI_TUTOR_ENDPOINTS } from '@constants/api.constants'

const endpoints = AI_TUTOR_ENDPOINTS

if (!endpoints?.RESPOND || !endpoints?.CONVERSATIONS) {
  throw new Error('AI Tutor endpoints chưa được cấu hình đúng trong frontend constants')
}

const aiTutorService = {
  async respond(payload) {
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined)
    )
    const response = await api.post(endpoints.RESPOND, cleanedPayload)
    return response.data
  },

  async listConversations() {
    const response = await api.get(endpoints.CONVERSATIONS)
    return response.data
  },

  async getConversation(id) {
    const response = await api.get(endpoints.CONVERSATION_DETAIL(id))
    return response.data
  },

  async sendFeedback(messageId, payload) {
    const response = await api.post(endpoints.FEEDBACK(messageId), payload)
    return response.data
  },
}

export default aiTutorService

