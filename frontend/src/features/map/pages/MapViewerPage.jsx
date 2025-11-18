import React, { useState, useRef, useEffect } from 'react'
import { MAP_CONFIG } from '@constants'
import { useAuth } from '@hooks'
import MapboxMap from '@components/map/MapboxMap'
import CollapsibleSidebar from '@components/layout/CollapsibleSidebar'
import MapTopToolbar from '@components/map/MapTopToolbar'
import ToolsPanel from '@components/map/ToolsPanel'
import LayersPanel from '@components/map/LayersPanel'
import LessonsPanel from '@components/map/LessonsPanel'
import QuizFloatingButton from '@components/map/QuizFloatingButton'
import QuizPanel from '@components/map/QuizPanel'
import gisService from '@services/gis.service'

const MapViewerPage = () => {
  const { user, logout } = useAuth()
  const mapRef = useRef(null)
  const [activePanel, setActivePanel] = useState(null)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false)
  const [layers, setLayers] = useState([])
  const [enabledLayers, setEnabledLayers] = useState(new Set())

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const toggle3D = () => {
    if (mapRef.current) {
      mapRef.current.toggle3D()
      setIs3DMode(!is3DMode)
    }
  }

  const toggleDarkMode = () => {
    if (mapRef.current) {
      mapRef.current.toggleStyle(!isDarkMode)
      setIsDarkMode(!isDarkMode)
    }
  }

  const handleMapLoad = async (map) => {
    console.log('Mapbox map loaded successfully')

    // Load layers from backend
    try {
      const response = await gisService.listLayers()
      const layersData = response.results || response || []
      setLayers(layersData)
      console.log('Loaded layers:', layersData)
    } catch (error) {
      console.error('Failed to load layers:', error)
    }
  }

  const toggleLayer = async (layerId, enabled) => {
    const newEnabledLayers = new Set(enabledLayers)

    if (enabled) {
      newEnabledLayers.add(layerId)

      // Load layer features from backend
      try {
        const featuresData = await gisService.getFeatures(layerId)

        if (mapRef.current && featuresData.features) {
          // Add GeoJSON source and layer
          mapRef.current.addGeoJSONSource(`layer-${layerId}`, featuresData)

          // Determine layer type and add appropriate layer
          const firstFeature = featuresData.features[0]
          if (firstFeature) {
            const geomType = firstFeature.geometry.type

            if (geomType === 'Point' || geomType === 'MultiPoint') {
              mapRef.current.addLayer({
                id: `layer-${layerId}`,
                type: 'circle',
                source: `layer-${layerId}`,
                paint: {
                  'circle-radius': 6,
                  'circle-color': '#34a853',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff'
                }
              })

              // Add click handler for points
              mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
                const coordinates = feature.geometry.coordinates.slice()
                const properties = feature.properties

                // Create clean popup HTML with simple styling
                let popupHTML = `
                  <div style="font-family: system-ui, sans-serif; max-width: 240px;">
                    <div style="background: #34a853; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                      <strong style="font-size: 14px;">📍 ${properties.name || 'Unnamed Location'}</strong>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                `

                // Add properties as table rows
                Object.keys(properties).forEach(key => {
                  if (key !== 'name' && key !== 'id' && properties[key]) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
                    popupHTML += `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px 8px 6px 0; font-weight: 600; color: #666; font-size: 12px; vertical-align: top;">${label}:</td>
                        <td style="padding: 6px 0; color: #333; font-size: 12px;">${properties[key]}</td>
                      </tr>
                    `
                  }
                })

                popupHTML += `
                    </table>
                  </div>
                `

                // Show popup
                mapRef.current.showPopup(coordinates, popupHTML)
              })
            } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
              mapRef.current.addLayer({
                id: `layer-${layerId}`,
                type: 'line',
                source: `layer-${layerId}`,
                paint: {
                  'line-color': '#34a853',
                  'line-width': 3
                }
              })

              // Add click handler for lines
              mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
                const coordinates = feature.geometry.coordinates[0]
                const properties = feature.properties

                let popupHTML = `
                  <div style="font-family: system-ui, sans-serif; max-width: 240px;">
                    <div style="background: #667eea; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                      <strong style="font-size: 14px;">🛣️ ${properties.name || 'Unnamed Route'}</strong>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                `

                Object.keys(properties).forEach(key => {
                  if (key !== 'name' && key !== 'id' && properties[key]) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
                    popupHTML += `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px 8px 6px 0; font-weight: 600; color: #666; font-size: 12px; vertical-align: top;">${label}:</td>
                        <td style="padding: 6px 0; color: #333; font-size: 12px;">${properties[key]}</td>
                      </tr>
                    `
                  }
                })

                popupHTML += '</table></div>'
                mapRef.current.showPopup(coordinates, popupHTML)
              })
            } else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
              // Add fill layer
              mapRef.current.addLayer({
                id: `layer-${layerId}-fill`,
                type: 'fill',
                source: `layer-${layerId}`,
                paint: {
                  'fill-color': '#34a853',
                  'fill-opacity': 0.3
                }
              })
              // Add outline layer
              mapRef.current.addLayer({
                id: `layer-${layerId}-outline`,
                type: 'line',
                source: `layer-${layerId}`,
                paint: {
                  'line-color': '#34a853',
                  'line-width': 2
                }
              })

              // Add click handler for polygons
              mapRef.current.addClickHandler(`layer-${layerId}-fill`, (feature) => {
                const coordinates = feature.geometry.coordinates[0][0]
                const properties = feature.properties

                let popupHTML = `
                  <div style="font-family: system-ui, sans-serif; max-width: 240px;">
                    <div style="background: #f5576c; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                      <strong style="font-size: 14px;">🗺️ ${properties.name || 'Unnamed Area'}</strong>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                `

                Object.keys(properties).forEach(key => {
                  if (key !== 'name' && key !== 'id' && properties[key]) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
                    popupHTML += `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 6px 8px 6px 0; font-weight: 600; color: #666; font-size: 12px; vertical-align: top;">${label}:</td>
                        <td style="padding: 6px 0; color: #333; font-size: 12px;">${properties[key]}</td>
                      </tr>
                    `
                  }
                })

                popupHTML += '</table></div>'
                mapRef.current.showPopup(coordinates, popupHTML)
              })
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load layer ${layerId}:`, error)
      }
    } else {
      newEnabledLayers.delete(layerId)

      // Remove click handlers and layers from map
      if (mapRef.current) {
        mapRef.current.removeClickHandler(`layer-${layerId}`)
        mapRef.current.removeClickHandler(`layer-${layerId}-fill`)
        mapRef.current.removeLayer(`layer-${layerId}`)
        mapRef.current.removeLayer(`layer-${layerId}-fill`)
        mapRef.current.removeLayer(`layer-${layerId}-outline`)
        mapRef.current.removeSource(`layer-${layerId}`)
      }
    }

    setEnabledLayers(newEnabledLayers)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar user={user} onLogout={logout} />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Mapbox Map Container */}
        <MapboxMap
          ref={mapRef}
          initialCenter={MAP_CONFIG.DEFAULT_CENTER}
          initialZoom={MAP_CONFIG.DEFAULT_ZOOM}
          onMapLoad={handleMapLoad}
        />

        {/* Top Toolbar */}
        <MapTopToolbar activePanel={activePanel} onTogglePanel={togglePanel} />

        {/* 3D & Dark Mode Controls */}
        <div className="absolute top-28 right-8 z-20 flex flex-col gap-3">
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            title="Toggle Dark/Light Mode"
          >
            <span className="text-2xl">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
          <button
            onClick={toggle3D}
            className={`w-12 h-12 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 ${
              is3DMode
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle 3D View"
          >
            <span className="text-2xl">🗻</span>
          </button>
        </div>

        {/* Panel Dropdowns */}
        {activePanel === 'tools' && <ToolsPanel />}
        {activePanel === 'layers' && (
          <LayersPanel
            layers={layers}
            enabledLayers={enabledLayers}
            onToggleLayer={toggleLayer}
          />
        )}
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
