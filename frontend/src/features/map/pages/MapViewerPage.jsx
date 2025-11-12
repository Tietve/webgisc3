import React, { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { MAP_CONFIG } from '@constants'
import { useAuth } from '@hooks'
import CollapsibleSidebar from '@components/layout/CollapsibleSidebar'
import MapTopToolbar from '@components/map/MapTopToolbar'
import ToolsPanel from '@components/map/ToolsPanel'
import LayersPanel from '@components/map/LayersPanel'
import LessonsPanel from '@components/map/LessonsPanel'
import QuizFloatingButton from '@components/map/QuizFloatingButton'
import QuizPanel from '@components/map/QuizPanel'
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
  const { user, logout } = useAuth()
  const [activePanel, setActivePanel] = useState(null)
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar user={user} onLogout={logout} />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Leaflet Map Container */}
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

        {/* Top Toolbar */}
        <MapTopToolbar activePanel={activePanel} onTogglePanel={togglePanel} />

        {/* Panel Dropdowns */}
        {activePanel === 'tools' && <ToolsPanel />}
        {activePanel === 'layers' && <LayersPanel />}
        {activePanel === 'lessons' && <LessonsPanel />}

        {/* Quiz Floating Button */}
        <QuizFloatingButton
          onClick={() => setIsQuizOpen(true)}
          hasActiveQuiz={true}
        />

        {/* Quiz Panel */}
        <QuizPanel
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />
      </div>
    </div>
  )
}

export default MapViewerPage
