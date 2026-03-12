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
import { getModuleCatalog, matchLayerGuide } from '@features/grade10/data/moduleCatalog'
import { buildFeaturePopupHTML, getFeatureAnchor, getFeatureDisplayName, getLayerVisualSpec } from '@features/map/utils/layerPresentation'

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
    setQuizQuestionContext([])
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
      (lesson.layers || []).forEach((layer) => ids.add(layer.id))
    })
    return ids
  }, [moduleLessons])

  const activeModuleCode = searchParams.get('module') || moduleLessons[0]?.module_code || ''
  const activeModuleMeta = useMemo(() => getModuleCatalog(activeModuleCode), [activeModuleCode])

  const coreLayerIds = useMemo(() => {
    if (!activeModuleMeta) return []
    const selected = []
    layers.forEach((layer) => {
      if (matchLayerGuide(activeModuleCode, layer.name)) {
        selected.push(layer.id)
      }
    })
    return selected
  }, [activeModuleCode, activeModuleMeta, layers])

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
      setSelectedFeature(null)

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

    const layerMeta = layers.find((item) => item.id === layerId) || {}
    const firstFeature = featuresData.features[0]
    const geomType = firstFeature.geometry.type
    const spec = getLayerVisualSpec({ layerName: layerMeta.name, geomType })

    mapRef.current.addGeoJSONSource(`layer-${layerId}`, featuresData)

    if (geomType === 'Point' || geomType === 'MultiPoint') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'circle',
        source: `layer-${layerId}`,
        paint: spec.paint,
      })
      mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
        const properties = feature.properties || {}
        setSelectedFeature({
          layer_id: layerId,
          layer_name: layerMeta.name,
          geometry_type: geomType,
          properties,
        })
        const coordinates = getFeatureAnchor(feature)
        if (coordinates) {
          mapRef.current.showPopup(coordinates, buildFeaturePopupHTML({ properties, accent: spec.palette.base, layerName: layerMeta.name }))
        }
      })
      return
    }

    if (geomType === 'LineString' || geomType === 'MultiLineString') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: spec.paint,
      })
      mapRef.current.addClickHandler(`layer-${layerId}`, (feature) => {
        const properties = feature.properties || {}
        setSelectedFeature({
          layer_id: layerId,
          layer_name: layerMeta.name,
          geometry_type: geomType,
          properties,
        })
        const coordinates = getFeatureAnchor(feature)
        if (coordinates) {
          mapRef.current.showPopup(coordinates, buildFeaturePopupHTML({ properties, accent: spec.palette.base, layerName: layerMeta.name }))
        }
      })
      return
    }

    mapRef.current.addLayer({
      id: `layer-${layerId}-fill`,
      type: 'fill',
      source: `layer-${layerId}`,
      paint: spec.fillPaint,
    })
    mapRef.current.addLayer({
      id: `layer-${layerId}-outline`,
      type: 'line',
      source: `layer-${layerId}`,
      paint: spec.outlinePaint,
    })
    mapRef.current.addClickHandler(`layer-${layerId}-fill`, (feature) => {
      const properties = feature.properties || {}
      setSelectedFeature({
        layer_id: layerId,
        layer_name: layerMeta.name,
        geometry_type: geomType,
        properties,
      })
      const coordinates = getFeatureAnchor(feature)
      if (coordinates) {
        mapRef.current.showPopup(coordinates, buildFeaturePopupHTML({ properties, accent: spec.palette.base, layerName: layerMeta.name }))
      }
    })
  }

  const toggleLayer = async (layerId, enabled = !enabledLayers.has(layerId)) => {
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
      setSelectedFeature((current) => (current?.layer_id === layerId ? null : current))

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

  const activeLessonId = useMemo(() => {
    const queryLesson = searchParams.get('lesson')
    if (queryLesson) {
      return Number(queryLesson)
    }

    const firstModuleLesson = moduleLessons[0]
    return firstModuleLesson?.id
  }, [moduleLessons, searchParams])

  const aiContext = useMemo(() => ({
    lesson_id: activeLessonId,
    quiz_id: activeQuizId ? Number(activeQuizId) : undefined,
    classroom_id: searchParams.get('classroom') ? Number(searchParams.get('classroom')) : undefined,
    lesson_step: undefined,
    active_layers: Array.from(enabledLayers),
    selected_feature: selectedFeature || undefined,
    map_state: getMapState() || undefined,
    question_context: quizQuestionContext,
    grade_level: searchParams.get('grade') || '10',
    semester: searchParams.get('semester') || '1',
    textbook_series: searchParams.get('textbook') || 'canh-dieu',
    module_code: searchParams.get('module') || moduleLessons[0]?.module_code || '',
  }), [activeLessonId, activeQuizId, enabledLayers, moduleLessons, quizQuestionContext, searchParams, selectedFeature])



  useEffect(() => {
    if (!isStudentView || hasAutoEnabledLayers || layers.length === 0) return

    const autoEnable = async () => {
      const targetLayerIds = coreLayerIds.length > 0 ? coreLayerIds : layers.slice(0, 4).map((layer) => layer.id)
      for (const layerId of targetLayerIds.slice(0, 5)) {
        await toggleLayer(layerId, true)
      }
      setHasAutoEnabledLayers(true)
    }

    autoEnable().catch((error) => console.error('Failed to auto-enable student layers:', error))
  }, [isStudentView, hasAutoEnabledLayers, layers, coreLayerIds])

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
            studentView={isStudentView}
            moduleCode={activeModuleCode}
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
        {activePanel === 'assignments' && searchParams.get('classroom') && (
          <AssignmentList
            classroomId={null}
            onAssignmentClick={(assignment) => {
              console.log('Assignment clicked:', assignment)
              // TODO: Navigate to assignment detail
            }}
          />
        )}
        <AITutorPanel
          isOpen={activePanel === 'ai'}
          onClose={() => setActivePanel(null)}
          context={aiContext}
          title="AI Tutor Địa lí 10"
        />

        {selectedFeature && (
          <div className="absolute bottom-24 right-6 z-20 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{'\u0110\u1ed1i t\u01b0\u1ee3ng \u0111ang ch\u1ecdn'}</p>
                <h4 className="mt-1 text-sm font-semibold text-slate-900">{getFeatureDisplayName(selectedFeature.properties)}</h4>
                <p className="mt-1 text-xs text-slate-500">{selectedFeature.layer_name || `Layer ${selectedFeature.layer_id}`}</p>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">{'\u0110\xf3ng'}</button>
            </div>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {Object.entries(selectedFeature.properties || {})
                .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== '')
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{key.replace(/_/g, ' ')}</p>
                    <p className="mt-1 text-sm text-slate-800">{String(value)}</p>
                  </div>
                ))}
            </div>
          </div>
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
