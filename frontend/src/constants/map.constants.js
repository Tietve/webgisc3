// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT) || 16.0,
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG) || 108.0,
  ],
  DEFAULT_ZOOM: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 6,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_LAYER_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

// Tool Types
export const TOOL_TYPES = {
  DRAW: 'draw',
  MEASURE: 'measure',
  BUFFER: 'buffer',
}

// Panel Types
export const PANEL_TYPES = {
  TOOLS: 'tools',
  LAYERS: 'layers',
  LESSONS: 'lessons',
}

// Layer Styles
export const LAYER_STYLES = {
  DEFAULT: {
    color: '#3498db',
    fillColor: '#3498db',
    fillOpacity: 0.3,
    weight: 2,
  },
  HIGHLIGHTED: {
    color: '#e74c3c',
    fillColor: '#e74c3c',
    fillOpacity: 0.5,
    weight: 3,
  },
}

// Drawing Options
export const DRAW_OPTIONS = {
  position: 'topright',
  draw: {
    polygon: {
      allowIntersection: false,
      drawError: {
        color: '#e74c3c',
        message: '<strong>Error:</strong> shape edges cannot cross!',
      },
      shapeOptions: {
        color: '#667eea',
      },
    },
    polyline: {
      shapeOptions: {
        color: '#667eea',
      },
    },
    circle: false,
    rectangle: {
      shapeOptions: {
        color: '#667eea',
      },
    },
    marker: true,
    circlemarker: false,
  },
  edit: {
    featureGroup: null, // Will be set dynamically
    remove: true,
  },
}
