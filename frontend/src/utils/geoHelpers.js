import * as turf from '@turf/turf'

/**
 * GeoJSON and Map utility functions
 * Note: Migrated from Leaflet to Turf.js for Mapbox compatibility
 */

/**
 * Calculate distance between two points (in km)
 * @param {Array} latlng1 - [lat, lng]
 * @param {Array} latlng2 - [lat, lng]
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (latlng1, latlng2) => {
  const from = turf.point([latlng1[1], latlng1[0]]) // [lng, lat] for Turf
  const to = turf.point([latlng2[1], latlng2[0]])
  return turf.distance(from, to, { units: 'kilometers' })
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
  const coordinates = latlngs.map(point => [point[1], point[0]]) // Convert to [lng, lat]
  const line = turf.lineString(coordinates)
  return turf.length(line, { units: 'kilometers' })
}

/**
 * Calculate area of a polygon (in km²)
 * @param {Array} latlngs - Array of [lat, lng] points
 * @returns {number} Area in square kilometers
 */
export const calculatePolygonArea = (latlngs) => {
  const coordinates = latlngs.map(point => [point[1], point[0]]) // Convert to [lng, lat]
  coordinates.push(coordinates[0]) // Close the polygon
  const polygon = turf.polygon([coordinates])
  return turf.area(polygon) / 1000000 // Convert m² to km²
}

/**
 * Convert GeoJSON coordinates to bounds
 * @param {Object} geojson - GeoJSON object
 * @returns {Array} Bounds [[minLng, minLat], [maxLng, maxLat]]
 */
export const getGeoJSONBounds = (geojson) => {
  const bbox = turf.bbox(geojson)
  return [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] // [[minLng, minLat], [maxLng, maxLat]]
}

/**
 * Validate GeoJSON
 * @param {Object} geojson - GeoJSON object
 * @returns {boolean} Valid or not
 */
export const geoJSONToLayer = (geojson) => {
  // For Mapbox, we can just return the geojson as-is
  // This is a compatibility shim
  return geojson
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
