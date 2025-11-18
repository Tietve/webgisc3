import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import Map, { NavigationControl, ScaleControl, FullscreenControl, GeolocateControl, Popup } from 'react-map-gl'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGhpZW5odXUyMDA1IiwiYSI6ImNtaHQ0dmw5bzB2MnAya3BzdGtxcTFiYjgifQ.EY3a0A0vjNR30dZcsPXvAw'

const MapboxMap = forwardRef(({
  initialCenter = [105.8342, 21.0278],
  initialZoom = 12,
  onMapLoad,
  children
}, ref) => {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState({
    longitude: initialCenter[0],
    latitude: initialCenter[1],
    zoom: initialZoom,
    pitch: 0,
    bearing: 0
  })

  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12')
  const [is3DMode, setIs3DMode] = useState(false)

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current?.getMap(),

    toggle3D: () => {
      const map = mapRef.current?.getMap()
      if (!map) return

      const new3DState = !is3DMode
      setIs3DMode(new3DState)

      if (new3DState) {
        // Enable 3D terrain
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          })
        }

        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

        // Animate to 3D view
        map.easeTo({
          pitch: 60,
          bearing: 0,
          duration: 1000
        })

        // Add sky layer if not exists
        if (!map.getLayer('sky')) {
          map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15
            }
          })
        }
      } else {
        // Disable 3D terrain
        map.setTerrain(null)

        // Animate to 2D view
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000
        })

        // Remove sky layer
        if (map.getLayer('sky')) {
          map.removeLayer('sky')
        }
      }
    },

    toggleStyle: (isDark) => {
      const newStyle = isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12'
      setMapStyle(newStyle)
    },

    flyTo: (coordinates, zoom = 14) => {
      const map = mapRef.current?.getMap()
      if (map) {
        map.flyTo({
          center: coordinates,
          zoom: zoom,
          duration: 2000
        })
      }
    },

    addGeoJSONSource: (sourceId, data) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(data)
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: data
        })
      }
    },

    addLayer: (layerConfig) => {
      const map = mapRef.current?.getMap()
      if (!map || map.getLayer(layerConfig.id)) return

      map.addLayer(layerConfig)
    },

    removeLayer: (layerId) => {
      const map = mapRef.current?.getMap()
      if (!map || !map.getLayer(layerId)) return

      map.removeLayer(layerId)
    },

    removeSource: (sourceId) => {
      const map = mapRef.current?.getMap()
      if (!map || !map.getSource(sourceId)) return

      map.removeSource(sourceId)
    },

    setLayerVisibility: (layerId, visible) => {
      const map = mapRef.current?.getMap()
      if (!map || !map.getLayer(layerId)) return

      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
    },

    addClickHandler: (layerId, callback) => {
      const map = mapRef.current?.getMap()
      if (!map || !map.getLayer(layerId)) return

      // Change cursor on hover
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = ''
      })

      // Add click handler
      map.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0) {
          callback(e.features[0])
        }
      })
    },

    removeClickHandler: (layerId) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      map.off('mouseenter', layerId)
      map.off('mouseleave', layerId)
      map.off('click', layerId)
    },

    showPopup: (lngLat, content) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(content)
        .addTo(map)
    }
  }))

  const handleMapLoad = () => {
    const map = mapRef.current?.getMap()
    if (map && onMapLoad) {
      onMapLoad(map)
    }
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle={mapStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      onLoad={handleMapLoad}
      attributionControl={true}
      antialias={true}
    >
      {/* Navigation Controls */}
      <NavigationControl position="bottom-left" showCompass={true} />

      {/* Scale Control */}
      <ScaleControl position="bottom-right" />

      {/* Fullscreen Control */}
      <FullscreenControl position="top-right" />

      {/* Geolocate Control */}
      <GeolocateControl
        position="top-right"
        trackUserLocation={true}
        showUserHeading={true}
      />

      {children}
    </Map>
  )
})

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap
