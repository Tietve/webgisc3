import api from './api'
import { ENDPOINTS } from '@constants'

const gisService = {
  async listLayers() {
    const response = await api.get(ENDPOINTS.GIS.LAYERS)
    return response.data
  },

  async getLayer(id) {
    const response = await api.get(ENDPOINTS.GIS.LAYER_DETAIL(id))
    return response.data
  },

  async getFeatures(layerId, bbox = null) {
    const params = bbox ? { bbox } : {}
    const response = await api.get(ENDPOINTS.GIS.FEATURES(layerId), { params })
    return response.data
  },
}

export default gisService
