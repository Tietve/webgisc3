import api from './api'

const endpoints = {
  RESPOND: '/ai-tutor/respond/',
  CONVERSATIONS: '/ai-tutor/conversations/',
  CONVERSATION_DETAIL: (id) => `/ai-tutor/conversations/${id}/`,
  FEEDBACK: (id) => `/ai-tutor/messages/${id}/feedback/`,
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
