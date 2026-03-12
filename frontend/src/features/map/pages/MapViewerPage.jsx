import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MAP_CONFIG, ROUTES } from '@constants'
import { useAuth } from '@hooks'
import MapboxMap from '@components/map/MapboxMap'
import CollapsibleSidebar from '@components/layout/CollapsibleSidebar'
import MapTopToolbar from '@components/map/MapTopToolbar'
import ToolsPanel from '@components/map/ToolsPanel'
import LayersPanel from '@components/map/LayersPanel'
import LessonsPanel from '@components/map/LessonsPanel'
import QuizFloatingButton from '@components/map/QuizFloatingButton'
import QuizPanel from '@components/map/QuizPanel'
import DeadlineWidget from '@components/map/DeadlineWidget'
import AITutorPanel from '@components/ai/AITutorPanel'
import AssignmentList from '@components/classroom/AssignmentList'
import gisService from '@services/gis.service'
import quizService from '@services/quiz.service'
import lessonService from '@services/lesson.service'

const MapViewerPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mapRef = useRef(null)
  const [activePanel, setActivePanel] = useState(null)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false)
  const [layers, setLayers] = useState([])
  const [moduleLessons, setModuleLessons] = useState([])
  const [enabledLayers, setEnabledLayers] = useState(new Set())
  const [activeQuizId, setActiveQuizId] = useState(searchParams.get('quiz'))
  const [hasAutoEnabledLayers, setHasAutoEnabledLayers] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [quizQuestionContext, setQuizQuestionContext] = useState([])

  // Store loaded GeoJSON data so layers can be re-added after style changes
  const loadedGeoJSONRef = useRef({})
  const isStudentView = searchParams.get('studentView') === '1'
  const layerFilters = useMemo(() => ({
    school: searchParams.get('school') || (searchParams.get('grade') === '10' ? 'THPT' : undefined),
    grade: searchParams.get('grade') || undefined,
  }), [searchParams])
  const lessonFilters = useMemo(() => ({
    grade_level: searchParams.get('grade') || undefined,
    semester: searchParams.get('semester') || undefined,
    textbook_series: searchParams.get('textbook') || undefined,
    module_code: searchParams.get('module') || undefined,
  }), [searchParams])

  useEffect(() => {
    const quizFromQuery = searchParams.get('quiz')
    setActiveQuizId(quizFromQuery || null)
  }, [searchParams])

  useEffect(() => {
    if (!isStudentView) return

    const loadStudentContext = async () => {
      try {
        const [quizResponse, lessonResponse] = await Promise.all([
          quizService.list(lessonFilters),
          lessonService.list(lessonFilters),
        ])
        const quizzes = quizResponse.results || quizResponse || []
        const lessons = lessonResponse.results || lessonResponse || []
        setModuleLessons(lessons)
        if (!searchParams.get('quiz') && quizzes.length > 0) {
          setActiveQuizId(quizzes[0].id)
        }
      } catch (error) {
        console.error('Failed to load student context:', error)
      }
    }

    loadStudentContext()
  }, [isStudentView, lessonFilters, searchParams])

  const curatedLayerIds = useMemo(() => {
    const ids = new Set()
    moduleLessons.forEach((lesson) => {
      ;(lesson.layers || []).forEach((layer) => ids.add(layer.id))
    })
    return ids
  }, [moduleLessons])

  useEffect(() => {
    if (!isStudentView || curatedLayerIds.size === 0) return
    setLayers((current) => current.filter((layer) => curatedLayerIds.has(layer.id)))
    setHasAutoEnabledLayers(false)
  }, [isStudentView, curatedLayerIds])

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

      // Re-add all enabled layers after style change (Mapbox removes them on style switch)
      const map = mapRef.current.getMap()
      if (map) {
        map.once('style.load', () => {
          enabledLayers.forEach(layerId => {
            const geoData = loadedGeoJSONRef.current[layerId]
            if (geoData) {
              addLayerToMap(layerId, geoData)
            }
          })
        })
      }
    }
  }

  const handleMapLoad = async () => {
    console.log('Mapbox map loaded successfully')

    // Load layers from backend
    try {
      const response = await gisService.listLayers(layerFilters)
      const layersData = response.results || response || []
      const filteredLayers = isStudentView && curatedLayerIds.size > 0
        ? layersData.filter((layer) => curatedLayerIds.has(layer.id))
        : layersData
      setLayers(filteredLayers)
      console.log('Loaded layers:', filteredLayers)
    } catch (error) {
      console.error('Failed to load layers:', error)
    }
  }

  // Helper: add a GeoJSON layer to the map based on geometry type
  const addLayerToMap = (layerId, featuresData) => {
    if (!mapRef.current || !featuresData.features || featuresData.features.length === 0) return

    mapRef.current.addGeoJSONSource(`layer-${layerId}`, featuresData)

    const firstFeature = featuresData.features[0]
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

      mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
        const coordinates = feature.geometry.coordinates.slice()
        const properties = feature.properties
        setSelectedFeature({ layer_id: layerId, geometry_type: geomType, properties })

        let popupHTML = `
          <div style="font-family: system-ui, sans-serif; max-width: 240px;">
            <div style="background: #34a853; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
              <strong style="font-size: 14px;">${properties.name || 'Unnamed Location'}</strong>
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

      mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
        const coordinates = feature.geometry.coordinates[0]
        const properties = feature.properties
        setSelectedFeature({ layer_id: layerId, geometry_type: geomType, properties })

        let popupHTML = `
          <div style="font-family: system-ui, sans-serif; max-width: 240px;">
            <div style="background: #667eea; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
              <strong style="font-size: 14px;">${properties.name || 'Unnamed Route'}</strong>
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
      mapRef.current.addLayer({
        id: `layer-${layerId}-fill`,
        type: 'fill',
        source: `layer-${layerId}`,
        paint: {
          'fill-color': '#34a853',
          'fill-opacity': 0.3
        }
      })
      mapRef.current.addLayer({
        id: `layer-${layerId}-outline`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: {
          'line-color': '#34a853',
          'line-width': 2
        }
      })

      mapRef.current.addClickHandler(`layer-${layerId}-fill`, (feature) => {
        const coordinates = feature.geometry.coordinates[0][0]
        const properties = feature.properties
        setSelectedFeature({ layer_id: layerId, geometry_type: geomType, properties })

        let popupHTML = `
          <div style="font-family: system-ui, sans-serif; max-width: 240px;">
            <div style="background: #f5576c; color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
              <strong style="font-size: 14px;">${properties.name || 'Unnamed Area'}</strong>
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

  const toggleLayer = async (layerId, enabled) => {
    const newEnabledLayers = new Set(enabledLayers)

    if (enabled) {
      newEnabledLayers.add(layerId)

      // Load layer features from backend
      try {
        const featuresData = await gisService.getFeatures(layerId)

        if (featuresData.features) {
          // Cache GeoJSON data for re-adding after style changes
          loadedGeoJSONRef.current[layerId] = featuresData
          addLayerToMap(layerId, featuresData)
        }
      } catch (error) {
        console.error(`Failed to load layer ${layerId}:`, error)
      }
    } else {
      newEnabledLayers.delete(layerId)

      // Clean up cached data
      delete loadedGeoJSONRef.current[layerId]

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

  const getMapState = () => {
    const map = mapRef.current?.getMap?.()
    if (!map) return null

    const center = map.getCenter()
    return {
      center: [Number(center.lng.toFixed(6)), Number(center.lat.toFixed(6))],
      zoom: Number(map.getZoom().toFixed(2)),
      pitch: Number(map.getPitch().toFixed(2)),
      bearing: Number(map.getBearing().toFixed(2)),
    }
  }

  const aiContext = {
    lesson_id: searchParams.get('lesson') ? Number(searchParams.get('lesson')) : undefined,
    quiz_id: activeQuizId ? Number(activeQuizId) : undefined,
    classroom_id: searchParams.get('classroom') ? Number(searchParams.get('classroom')) : undefined,
    lesson_step: undefined,
    active_layers: Array.from(enabledLayers),
    selected_feature: selectedFeature || undefined,
    map_state: getMapState(),
    question_context: quizQuestionContext,
    grade_level: searchParams.get('grade') || '10',
    semester: searchParams.get('semester') || '1',
    textbook_series: searchParams.get('textbook') || 'canh-dieu',
    module_code: searchParams.get('module') || '',
  }


  useEffect(() => {
    if (!isStudentView || hasAutoEnabledLayers || layers.length === 0) return

    const autoEnable = async () => {
      for (const layer of layers.slice(0, 4)) {
        // eslint-disable-next-line no-await-in-loop
        await toggleLayer(layer.id, true)
      }
      setHasAutoEnabledLayers(true)
    }

    autoEnable().catch((error) => console.error('Failed to auto-enable student layers:', error))
  }, [isStudentView, hasAutoEnabledLayers, layers])

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
        <MapTopToolbar activePanel={activePanel} onTogglePanel={togglePanel} compact={isStudentView} />

        {/* 3D & Dark Mode Controls */}
        <div className="absolute top-28 right-8 z-20 flex flex-col gap-3">
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            title="Toggle Dark/Light Mode"
          >
            <span className="text-2xl">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
          {!isStudentView && (
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
          )}
        </div>

        {/* Deadline Widget - Always visible */}
        <DeadlineWidget
          onDeadlineClick={(deadline) => {
            if ((deadline.type || 'quiz') === 'quiz') {
              navigate(ROUTES.QUIZ.replace(':id', deadline.id))
            }
          }}
        />

        {/* Panel Dropdowns */}
        {activePanel === 'tools' && !isStudentView && <ToolsPanel />}
        {activePanel === 'layers' && (
          <LayersPanel
            layers={layers}
            enabledLayers={enabledLayers}
            onToggleLayer={toggleLayer}
          />
        )}
        {activePanel === 'lessons' && (
          <LessonsPanel
            filters={lessonFilters}
            onLessonSelect={(lessonId) => {
              navigate(`/lessons/${lessonId}`)
            }}
          />
        )}
        {activePanel === 'assignments' && (
          <AssignmentList
            classroomId={null}
            onAssignmentClick={(assignment) => {
              console.log('Assignment clicked:', assignment)
              // TODO: Navigate to assignment detail
            }}
          />
        )}
        {activePanel === 'ai' && (
          <AITutorPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            context={aiContext}
            title="AI Tutor Địa lí 10"
          />
        )}

        {/* Quiz Floating Button */}
        <QuizFloatingButton
          onClick={() => setIsQuizOpen(true)}
          hasActiveQuiz={Boolean(activeQuizId)}
        />

        {/* Quiz Panel */}
        <QuizPanel
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          quizId={activeQuizId}
          onQuizSubmitted={(payload) => {
            setQuizQuestionContext(payload.question_results || [])
          }}
          onAskAi={() => {
            setActivePanel('ai')
          }}
        />
      </div>
    </div>
  )
}

export default MapViewerPage
