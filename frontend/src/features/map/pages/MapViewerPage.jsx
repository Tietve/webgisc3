import React, { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { MapLayout } from '@layouts'
import { MAP_CONFIG } from '@constants'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon issue
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const MapViewerPage = () => {
  const [activePanel, setActivePanel] = useState(null)

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <MapLayout>
      {/* Map Container */}
      <MapContainer
        center={MAP_CONFIG.DEFAULT_CENTER}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url={MAP_CONFIG.TILE_LAYER_URL}
          attribution={MAP_CONFIG.TILE_LAYER_ATTRIBUTION}
        />
      </MapContainer>

      {/* Floating Toolbar */}
      <div className="map-toolbar">
        <div
          className={`map-toolbar-btn ${activePanel === 'tools' ? 'active' : ''}`}
          onClick={() => togglePanel('tools')}
          title="Công cụ"
        >
          🛠️
        </div>
        <div
          className={`map-toolbar-btn ${activePanel === 'layers' ? 'active' : ''}`}
          onClick={() => togglePanel('layers')}
          title="Lớp bản đồ"
        >
          🗺️
        </div>
        <div
          className={`map-toolbar-btn ${activePanel === 'lessons' ? 'active' : ''}`}
          onClick={() => togglePanel('lessons')}
          title="Bài học"
        >
          📚
        </div>
      </div>

      {/* Tools Panel */}
      {activePanel === 'tools' && (
        <div className="map-panel" style={{ top: '80px' }}>
          <h3 className="text-lg font-semibold mb-4">Công cụ vẽ & Phân tích</h3>
          <div className="space-y-2">
            <button className="btn-secondary w-full text-sm">🖊️ Vẽ đối tượng</button>
            <button className="btn-secondary w-full text-sm">📏 Đo khoảng cách</button>
            <button className="btn-secondary w-full text-sm">🎯 Buffer (1km)</button>
            <button className="btn-secondary w-full text-sm">🗑️ Xóa tất cả</button>
          </div>
        </div>
      )}

      {/* Layers Panel */}
      {activePanel === 'layers' && (
        <div className="map-panel" style={{ top: '80px' }}>
          <h3 className="text-lg font-semibold mb-4">Lớp bản đồ</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">Vietnam Provinces</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">Points of Interest</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">Roads</span>
            </label>
          </div>
        </div>
      )}

      {/* Lessons Panel */}
      {activePanel === 'lessons' && (
        <div className="map-panel" style={{ top: '80px', minWidth: '320px' }}>
          <h3 className="text-lg font-semibold mb-4">📚 Bài học tương tác</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
              <p className="font-medium text-sm">Lesson 1: Introduction to GIS</p>
              <p className="text-xs text-gray-600 mt-1">Learn the basics of GIS</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
              <p className="font-medium text-sm">Lesson 2: Map Reading</p>
              <p className="text-xs text-gray-600 mt-1">Understanding map elements</p>
            </div>
          </div>
        </div>
      )}
    </MapLayout>
  )
}

export default MapViewerPage
