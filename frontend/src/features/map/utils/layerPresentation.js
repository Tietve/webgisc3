const COLOR_LIBRARY = {
  blue: { base: '#2563eb', soft: '#dbeafe', dark: '#1d4ed8' },
  emerald: { base: '#059669', soft: '#d1fae5', dark: '#047857' },
  amber: { base: '#d97706', soft: '#fef3c7', dark: '#b45309' },
  violet: { base: '#7c3aed', soft: '#ede9fe', dark: '#6d28d9' },
  rose: { base: '#e11d48', soft: '#ffe4e6', dark: '#be123c' },
  teal: { base: '#0f766e', soft: '#ccfbf1', dark: '#115e59' },
}

const KEYWORD_PALETTE = [
  { test: ['t?nh', 'ranh gi?i', 'l?u v?c', 'v?ng', '??i', 'mi?n', 'kh? h?u', 'd?ng ??a h?nh'], palette: 'blue' },
  { test: ['s?ng', 'th?y', 'bi?n', '??i d??ng'], palette: 'teal' },
  { test: ['gi?', 'kh? ?p', 'm?a', 'tr?m kh? t??ng'], palette: 'amber' },
  { test: ['m?ng', 'n?i l?a', '??ng ??t'], palette: 'rose' },
  { test: ['?i?m', '?? th?', 'd?n c?', 't?a ??', 'h? sinh th?i'], palette: 'violet' },
  { test: ['giao th?ng', 'kinh', 'v?', 'tuy?n'], palette: 'emerald' },
]

export const getLayerPalette = (layerName = '') => {
  const lower = String(layerName).toLowerCase()
  const match = KEYWORD_PALETTE.find((item) => item.test.some((keyword) => lower.includes(keyword)))
  return COLOR_LIBRARY[match?.palette || 'blue']
}

export const getLayerVisualSpec = ({ layerName = '', geomType = '' }) => {
  const palette = getLayerPalette(layerName)
  const type = String(geomType).toUpperCase()

  if (type.includes('POINT')) {
    return {
      palette,
      layerType: 'circle',
      paint: {
        'circle-radius': 7,
        'circle-color': palette.base,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.92,
      },
    }
  }

  if (type.includes('LINE')) {
    return {
      palette,
      layerType: 'line',
      paint: {
        'line-color': palette.base,
        'line-width': 4,
        'line-opacity': 0.88,
      },
    }
  }

  return {
    palette,
    layerType: 'fill',
    fillPaint: {
      'fill-color': palette.base,
      'fill-opacity': 0.28,
    },
    outlinePaint: {
      'line-color': palette.dark,
      'line-width': 2.2,
      'line-opacity': 0.92,
    },
  }
}

export const getFeatureAnchor = (feature) => {
  const geometry = feature?.geometry
  if (!geometry) return null

  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates
    case 'MultiPoint':
    case 'LineString':
      return geometry.coordinates?.[0] || null
    case 'MultiLineString':
      return geometry.coordinates?.[0]?.[0] || null
    case 'Polygon':
      return geometry.coordinates?.[0]?.[0] || null
    case 'MultiPolygon':
      return geometry.coordinates?.[0]?.[0]?.[0] || null
    default:
      return null
  }
}

export const getFeatureDisplayName = (properties = {}) => (
  properties.name || properties.title || properties.code || properties.category || '??i t??ng quan s?t'
)

export const buildFeaturePopupHTML = ({ properties = {}, accent = '#2563eb', layerName = '' }) => {
  const title = getFeatureDisplayName(properties)
  const rows = Object.entries(properties)
    .filter(([key, value]) => !['name', 'id'].includes(key) && value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:6px 8px 6px 0;font-weight:600;color:#475569;font-size:12px;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;color:#0f172a;font-size:12px;">${value}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:260px;">
      <div style="background:${accent};color:white;padding:10px 12px;margin-bottom:10px;border-radius:10px;">
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">Layer ?ang xem</div>
        <strong style="display:block;font-size:14px;line-height:1.4;">${title}</strong>
        ${layerName ? `<div style="font-size:11px;opacity:.9;margin-top:4px;">${layerName}</div>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows || '<tr><td style="font-size:12px;color:#475569;">Kh?ng c? thu?c t?nh b? sung.</td></tr>'}</table>
    </div>
  `
}
