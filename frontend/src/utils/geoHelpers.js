import * as L from 'leaflet'

/**
 * GeoJSON and Map utility functions
 */

/**
 * Calculate distance between two points (in km)
 * @param {Array} latlng1 - [lat, lng]
 * @param {Array} latlng2 - [lat, lng]
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (latlng1, latlng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(latlng2[0] - latlng1[0])
  const dLng = toRad(latlng2[1] - latlng1[1])

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(latlng1[0])) *
      Math.cos(toRad(latlng2[0])) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return (degrees * Math.PI) / 180
}

/**
 * Calculate total distance of a polyline (in km)
 * @param {Array} latlngs - Array of [lat, lng] points
 * @returns {number} Total distance in km
 */
export const calculatePolylineDistance = (latlngs) => {
  let totalDistance = 0
  for (let i = 0; i < latlngs.length - 1; i++) {
    totalDistance += calculateDistance(latlngs[i], latlngs[i + 1])
  }
  return totalDistance
}

/**
 * Calculate area of a polygon (approximate, in km²)
 * Uses Leaflet's built-in method
 * @param {Array} latlngs - Array of [lat, lng] points
 * @returns {number} Area in square kilometers
 */
export const calculatePolygonArea = (latlngs) => {
  const polygon = L.polygon(latlngs)
  const areaInMeters = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0])
  return areaInMeters / 1000000 // Convert to km²
}

/**
 * Convert GeoJSON to Leaflet layer
 * @param {Object} geojson - GeoJSON object
 * @returns {L.GeoJSON} Leaflet GeoJSON layer
 */
export const geoJSONToLayer = (geojson) => {
  return L.geoJSON(geojson)
}

/**
 * Get bounds from GeoJSON
 * @param {Object} geojson - GeoJSON object
 * @returns {L.LatLngBounds} Bounds
 */
export const getGeoJSONBounds = (geojson) => {
  const layer = L.geoJSON(geojson)
  return layer.getBounds()
}

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`
  }
  return `${distance.toFixed(2)} km`
}

/**
 * Format area for display
 * @param {number} area - Area in km²
 * @returns {string} Formatted string
 */
export const formatArea = (area) => {
  if (area < 1) {
    return `${(area * 1000000).toFixed(0)} m²`
  }
  return `${area.toFixed(2)} km²`
}
