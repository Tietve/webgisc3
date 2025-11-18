// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG) || 105.8342, // Longitude first for Mapbox
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT) || 21.0278,
  ],
  DEFAULT_ZOOM: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 12,
  MIN_ZOOM: 5,
  MAX_ZOOM: 22,
  MAPBOX_TOKEN: 'pk.eyJ1IjoidGhpZW5odXUyMDA1IiwiYSI6ImNtaHQ0dmw5bzB2MnAya3BzdGtxcTFiYjgifQ.EY3a0A0vjNR30dZcsPXvAw',
  STYLES: {
    LIGHT: 'mapbox://styles/mapbox/streets-v12',
    DARK: 'mapbox://styles/mapbox/dark-v11',
    SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
  }
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

// Mapbox Layer Styles
export const LAYER_STYLES = {
  POINT: {
    DEFAULT: {
      'circle-radius': 6,
      'circle-color': '#3498db',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.9
    },
    HIGHLIGHTED: {
      'circle-radius': 8,
      'circle-color': '#e74c3c',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 1
    }
  },
  LINE: {
    DEFAULT: {
      'line-color': '#3498db',
      'line-width': 3,
      'line-opacity': 0.8
    },
    HIGHLIGHTED: {
      'line-color': '#e74c3c',
      'line-width': 4,
      'line-opacity': 1
    }
  },
  POLYGON: {
    DEFAULT: {
      'fill-color': '#3498db',
      'fill-opacity': 0.3,
      'fill-outline-color': '#3498db'
    },
    HIGHLIGHTED: {
      'fill-color': '#e74c3c',
      'fill-opacity': 0.5,
      'fill-outline-color': '#e74c3c'
    }
  }
}

// Mapbox Drawing Options (for @mapbox/mapbox-gl-draw)
export const DRAW_OPTIONS = {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    line_string: true,
    point: true,
    trash: true
  },
  styles: [
    {
      id: 'gl-draw-polygon-fill',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      paint: {
        'fill-color': '#667eea',
        'fill-outline-color': '#667eea',
        'fill-opacity': 0.3
      }
    },
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': '#667eea',
        'line-width': 2
      }
    },
    {
      id: 'gl-draw-line',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': '#667eea',
        'line-width': 2
      }
    },
    {
      id: 'gl-draw-point',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#667eea',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    }
  ]
}
