import api from './api'
import { ENDPOINTS } from '@constants'

const toolsService = {
  async executeBuffer(inputGeoJSON, distance, units = 'meters') {
    const response = await api.post(ENDPOINTS.TOOLS.EXECUTE('buffer'), {
      input_geojson: inputGeoJSON,
      parameters: { distance, units },
    })
    return response.data
  },

  async executeIntersect(inputGeoJSON, overlayGeoJSON) {
    const response = await api.post(ENDPOINTS.TOOLS.EXECUTE('intersect'), {
      input_geojson: inputGeoJSON,
      overlay_geojson: overlayGeoJSON,
    })
    return response.data
  },
}

export default toolsService
