const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const COLOR_LIBRARY = {
  blue: { base: '#2563eb', soft: '#dbeafe', dark: '#1d4ed8' },
  emerald: { base: '#059669', soft: '#d1fae5', dark: '#047857' },
  amber: { base: '#d97706', soft: '#fef3c7', dark: '#b45309' },
  violet: { base: '#7c3aed', soft: '#ede9fe', dark: '#6d28d9' },
  rose: { base: '#e11d48', soft: '#ffe4e6', dark: '#be123c' },
  teal: { base: '#0f766e', soft: '#ccfbf1', dark: '#115e59' },
}

const KEYWORD_PALETTE = [
  { test: ['tinh', 'ranh gioi', 'luu vuc', 'vung', 'doi', 'mien', 'khi hau', 'dia hinh'], palette: 'blue' },
  { test: ['song', 'thuy', 'bien', 'dai duong'], palette: 'teal' },
  { test: ['gio', 'khi ap', 'mua', 'tram khi tuong'], palette: 'amber' },
  { test: ['mang', 'nui lua', 'dong dat'], palette: 'rose' },
  { test: ['diem', 'do thi', 'dan cu', 'toa do', 'he sinh thai'], palette: 'violet' },
  { test: ['giao thong', 'kinh', 'vi', 'tuyen'], palette: 'emerald' },
]

const PEDAGOGICAL_LABELS = {
  category: 'Loại đối tượng',
  type: 'Nhóm nội dung',
  description: 'Ý nghĩa học tập',
  code: 'Mã / ký hiệu',
  population: 'Quy mô dân số',
  area_km2: 'Diện tích (km²)',
  length_km: 'Chiều dài (km)',
  rainfall_mm: 'Lượng mưa (mm)',
  temperature_c: 'Nhiệt độ (°C)',
  station: 'Trạm quan sát',
}

export const getLayerPalette = (layerName = '') => {
  const lower = normalizeText(layerName)
  const match = KEYWORD_PALETTE.find((item) => item.test.some((keyword) => lower.includes(keyword)))
  return COLOR_LIBRARY[match?.palette || 'blue']
}

export const getLayerVisualSpec = ({ layerName = '', geomType = '' }) => {
  const palette = getLayerPalette(layerName)
  const type = String(geomType).toUpperCase()

  if (type.includes('POINT')) {
    return {
      palette,
      layerType: 'point',
      circlePaint: {
        'circle-radius': 8,
        'circle-color': palette.base,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.96,
      },
      labelLayout: {
        'text-field': ['coalesce', ['get', 'short_label'], ['get', 'name'], ['get', 'category'], 'Điểm'],
        'text-size': 11,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        'text-max-width': 10,
        'text-allow-overlap': false,
      },
      labelPaint: {
        'text-color': '#0f172a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.4,
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
        'line-opacity': 0.92,
      },
    }
  }

  return {
    palette,
    layerType: 'fill',
    fillPaint: {
      'fill-color': palette.base,
      'fill-opacity': 0.34,
    },
    outlinePaint: {
      'line-color': palette.dark,
      'line-width': 2.4,
      'line-opacity': 0.96,
    },
  }
}

export const getLegendVisualMeta = ({ layerName = '', geomType = '' }) => {
  const palette = getLayerPalette(layerName)
  const type = String(geomType).toUpperCase()

  if (type.includes('POINT')) {
    return { palette, preview: 'point', label: 'Điểm quan sát' }
  }
  if (type.includes('LINE')) {
    return { palette, preview: 'line', label: 'Tuyến quan sát' }
  }
  return { palette, preview: 'polygon', label: 'Vùng quan sát' }
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

const extendBounds = (bounds, coord) => {
  if (!Array.isArray(coord) || coord.length < 2) return bounds
  const [x, y] = coord
  if (!Number.isFinite(x) || !Number.isFinite(y)) return bounds
  if (!bounds) return [x, y, x, y]
  return [
    Math.min(bounds[0], x),
    Math.min(bounds[1], y),
    Math.max(bounds[2], x),
    Math.max(bounds[3], y),
  ]
}

const walkCoordinates = (coords, bounds = null) => {
  if (!Array.isArray(coords)) return bounds
  if (typeof coords[0] === 'number') return extendBounds(bounds, coords)
  return coords.reduce((acc, item) => walkCoordinates(item, acc), bounds)
}

export const getFeatureBounds = (featureCollection) => {
  const features = featureCollection?.features || []
  const rawBounds = features.reduce((acc, feature) => walkCoordinates(feature?.geometry?.coordinates, acc), null)
  if (!rawBounds) return null
  return [
    [rawBounds[0], rawBounds[1]],
    [rawBounds[2], rawBounds[3]],
  ]
}

export const getFeatureDisplayName = (properties = {}) => (
  properties.name || properties.title || properties.code || properties.category || 'Đối tượng quan sát'
)

const CANDIDATE_KEYS = [
  'category',
  'type',
  'description',
  'code',
  'temperature_c',
  'rainfall_mm',
  'population',
  'area_km2',
  'length_km',
]

const getPedagogicalRows = (properties = {}) => CANDIDATE_KEYS
  .filter((key) => properties[key] !== null && properties[key] !== undefined && String(properties[key]).trim() !== '')
  .slice(0, 4)
  .map((key) => ({
    key,
    label: PEDAGOGICAL_LABELS[key] || key,
    value: properties[key],
  }))

export const buildFeaturePopupHTML = ({ properties = {}, accent = '#2563eb', layerName = '' }) => {
  const title = getFeatureDisplayName(properties)
  const rows = getPedagogicalRows(properties)
    .map(({ label, value }) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:6px 8px 6px 0;font-weight:600;color:#475569;font-size:12px;vertical-align:top;">${label}</td>
        <td style="padding:6px 0;color:#0f172a;font-size:12px;">${value}</td>
      </tr>
    `)
    .join('')

  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:260px;">
      <div style="background:${accent};color:white;padding:10px 12px;margin-bottom:10px;border-radius:10px;">
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">Đối tượng đang xem</div>
        <strong style="display:block;font-size:14px;line-height:1.4;">${title}</strong>
        ${layerName ? `<div style="font-size:11px;opacity:.9;margin-top:4px;">${layerName}</div>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows || '<tr><td style="font-size:12px;color:#475569;">Hãy quan sát trực tiếp vị trí và ký hiệu của lớp này trên bản đồ.</td></tr>'}</table>
    </div>
  `
}
