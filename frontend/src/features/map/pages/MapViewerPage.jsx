import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@hooks'
import { MAP_CONFIG } from '@constants'
import { ROUTES } from '@constants/routes'
import CollapsibleSidebar from '@components/layout/CollapsibleSidebar'
import MapboxMap from '@components/map/MapboxMap'
import MapTopToolbar from '@components/map/MapTopToolbar'
import LayersPanel from '@components/map/LayersPanel'
import LessonsPanel from '@components/map/LessonsPanel'
import QuizPanel from '@components/map/QuizPanel'
import DeadlineWidget from '@components/map/DeadlineWidget'
import AITutorPanel from '@components/ai/AITutorPanel'
import AssignmentList from '@components/classroom/AssignmentList'
import gisService from '@services/gis.service'
import quizService from '@services/quiz.service'
import lessonService from '@services/lesson.service'
import { getModuleCatalog, matchLayerGuide } from '@features/grade10/data/moduleCatalog'
import { buildFeaturePopupHTML, getFeatureAnchor, getFeatureBounds, getFeatureDisplayName, getLayerVisualSpec, getLegendVisualMeta } from '@features/map/utils/layerPresentation'


const normalizeSearchText = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[??]/g, 'd')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim()

const escapeHtml = (value = '') => value
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const buildAiAgentPopup = ({ title, description }) => {
  const safeTitle = escapeHtml(title || 'V? tr? tr?n b?n ??')
  const safeDescription = escapeHtml(description || 'AI ?ang gi?p em ??nh v? nhanh tr?n b?n ??.')
  return `
    <div class="space-y-2">
      <div class="text-sm font-semibold text-slate-900">?? ${safeTitle}</div>
      <div class="text-xs leading-5 text-slate-600">${safeDescription}</div>
    </div>
  `
}

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

  const togglePanel = (panelName) => {
    if (panelName === '3d') {
      toggle3D()
    } else if (panelName === 'darkMode') {
      toggleDarkMode()
    } else if (panelName === 'quiz' && isStudentView) {
      setIsQuizOpen((current) => !current)
    } else {
      setActivePanel(activePanel === panelName ? null : panelName)
    }
  }

  const toggle3D = () => {
    if (mapRef.current) {
      mapRef.current.toggle3D(!is3DMode)
      setIs3DMode(!is3DMode)
    }
  }

  const toggleDarkMode = () => {
    if (mapRef.current) {
      mapRef.current.toggleDarkMode(!isDarkMode)
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
  const addLayerToMap = (layerId, featuresData, options = {}) => {
    if (!mapRef.current || !featuresData.features || featuresData.features.length === 0) return

    const layerMeta = layers.find((item) => item.id === layerId) || {}
    const firstFeature = featuresData.features[0]
    const geomType = firstFeature.geometry.type
    const spec = getLayerVisualSpec({ layerName: layerMeta.name, geomType })

    mapRef.current.addGeoJSONSource(`layer-${layerId}`, featuresData)

    const openFeature = (feature) => {
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
    }

    if (geomType === 'Point' || geomType === 'MultiPoint') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'circle',
        source: `layer-${layerId}`,
        paint: spec.circlePaint,
      })
      mapRef.current.addLayer({
        id: `layer-${layerId}-label`,
        type: 'symbol',
        source: `layer-${layerId}`,
        layout: spec.labelLayout,
        paint: spec.labelPaint,
      })
      mapRef.current.addClickHandler(`layer-${layerId}`, openFeature)
    } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: spec.paint,
      })
      mapRef.current.addClickHandler(`layer-${layerId}`, openFeature)
    } else {
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
      mapRef.current.addClickHandler(`layer-${layerId}-fill`, openFeature)
    }

    const bounds = getFeatureBounds(featuresData)
    if (options.fitBounds && bounds) {
      mapRef.current.fitBounds(bounds, { padding: 72, maxZoom: options.maxZoom ?? 7 })
    }
  }

  const fitMapToLayerIds = (layerIds = []) => {
    if (!mapRef.current) return

    const boundsList = layerIds
      .map((layerId) => getFeatureBounds(loadedGeoJSONRef.current[layerId]))
      .filter(Boolean)

    if (boundsList.length === 0) return

    const merged = boundsList.reduce((acc, bounds) => {
      if (!acc) return [...bounds]
      return [
        [Math.min(acc[0][0], bounds[0][0]), Math.min(acc[0][1], bounds[0][1])],
        [Math.max(acc[1][0], bounds[1][0]), Math.max(acc[1][1], bounds[1][1])],
      ]
    }, null)

    if (merged) {
      mapRef.current.fitBounds(merged, { padding: 72, maxZoom: 7 })
    }
  }

  const toggleLayer = async (layerId, enabled = !enabledLayers.has(layerId), options = {}) => {
    const { fitBounds = isStudentView } = options
    const newEnabledLayers = new Set(enabledLayers)

    if (enabled) {
      newEnabledLayers.add(layerId)

      try {
        const featuresData = await gisService.getFeatures(layerId)

        if (featuresData.features) {
          loadedGeoJSONRef.current[layerId] = featuresData
          addLayerToMap(layerId, featuresData, { fitBounds })
        }
      } catch (error) {
        console.error(`Failed to load layer ${layerId}:`, error)
      }
    } else {
      newEnabledLayers.delete(layerId)
      setSelectedFeature((current) => (current?.layer_id === layerId ? null : current))
      delete loadedGeoJSONRef.current[layerId]

      if (mapRef.current) {
        mapRef.current.removeClickHandler(`layer-${layerId}`)
        mapRef.current.removeClickHandler(`layer-${layerId}-fill`)
        mapRef.current.removeLayer(`layer-${layerId}`)
        mapRef.current.removeLayer(`layer-${layerId}-label`)
        mapRef.current.removeLayer(`layer-${layerId}-fill`)
        mapRef.current.removeLayer(`layer-${layerId}-outline`)
        mapRef.current.removeSource(`layer-${layerId}`)
      }
    }

    setEnabledLayers(newEnabledLayers)
  }


  const findLayerByKeyword = (keyword = '') => {
    const normalizedKeyword = normalizeSearchText(keyword)
    if (!normalizedKeyword) return null

    const directMatch = layers.find((layer) => {
      const normalizedLayerName = normalizeSearchText(layer.name)
      return normalizedLayerName.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedLayerName)
    })
    if (directMatch) return directMatch

    const guidedLayer = activeModuleMeta?.essentialLayers?.find((item) => {
      const candidates = [item.keyword, item.label, ...(item.aliases || [])]
      return candidates.some((candidate) => {
        const normalizedCandidate = normalizeSearchText(candidate)
        return normalizedCandidate.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedCandidate)
      })
    })

    if (!guidedLayer) return null

    return layers.find((layer) => {
      const matchedGuide = matchLayerGuide(activeModuleCode, layer.name)
      return matchedGuide?.keyword === guidedLayer.keyword
    }) || null
  }

  const executeMapActions = async (actions = []) => {
    if (!mapRef.current || !Array.isArray(actions)) return

    const nextEnabledLayerIds = new Set(enabledLayers)

    for (const action of actions.slice(0, 5)) {
      if (!action || typeof action !== 'object') continue

      if (action.type === 'fly_to_place') {
        const coordinates = Array.isArray(action.coordinates) ? action.coordinates : null
        if (coordinates?.length === 2 && coordinates.every((value) => Number.isFinite(Number(value)))) {
          mapRef.current.flyTo(coordinates.map(Number), Number(action.zoom) || 4)
        }
        continue
      }

      if (action.type === 'toggle_layer_by_keyword') {
        const matchedLayer = findLayerByKeyword(action.keyword)
        if (matchedLayer) {
          const shouldEnable = action.visible !== false
          if (shouldEnable) nextEnabledLayerIds.add(matchedLayer.id)
          else nextEnabledLayerIds.delete(matchedLayer.id)
          await toggleLayer(matchedLayer.id, shouldEnable, { fitBounds: false })
        }
        continue
      }

      if (action.type === 'fit_active_layers') {
        fitMapToLayerIds(Array.from(nextEnabledLayerIds))
        continue
      }

      if (action.type === 'open_popup') {
        const coordinates = Array.isArray(action.coordinates) ? action.coordinates : null
        if (coordinates?.length === 2 && coordinates.every((value) => Number.isFinite(Number(value)))) {
          mapRef.current.showPopup(coordinates.map(Number), buildAiAgentPopup(action))
        }
      }
    }
  }

  const handleAiAssistantResponse = (response) => {
    executeMapActions(response?.map_actions || []).catch((error) => {
      console.error('Failed to execute AI map actions:', error)
    })
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
      const selectedIds = targetLayerIds.slice(0, 5)

      for (const layerId of selectedIds) {
        await toggleLayer(layerId, true, { fitBounds: false })
      }

      fitMapToLayerIds(selectedIds)
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
              navigate(ROUTES.QUIZ.replace(':id', deadline.quiz || deadline.id))
            }
          }}
        />

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
            lessons={moduleLessons}
            filters={lessonFilters}
            studentView={isStudentView}
            moduleCode={activeModuleCode}
            onLessonSelect={(lessonId) => navigate(ROUTES.LESSON.replace(':id', lessonId))}
          />
        )}

        {activePanel === 'assignments' && (
          <AssignmentList classroomId={searchParams.get('classroom')} />
        )}

        {isStudentView && isQuizOpen && activeQuizId && (
          <div className="absolute inset-x-4 bottom-4 z-20 mx-auto max-w-xl rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur">
            <QuizPanel
              quizId={activeQuizId}
              compact
              onStart={() => navigate(ROUTES.QUIZ.replace(':id', activeQuizId))}
              onQuestionFocus={(question) => setQuizQuestionContext((prev) => {
                const next = [question.prompt || question.question_text, ...prev].filter(Boolean)
                return Array.from(new Set(next)).slice(0, 5)
              })}
            />
          </div>
        )}

        {selectedFeature && (
          <div className="absolute bottom-24 right-6 z-20 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">??i t??ng ?ang ch?n</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{getFeatureDisplayName(selectedFeature.properties)}</h3>
                <p className="mt-1 text-xs text-slate-500">{selectedFeature.layer_name || `Layer ${selectedFeature.layer_id}`}</p>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">??ng</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
              {[selectedFeature.geometry_type, selectedFeature.properties?.category].filter(Boolean).map((badge) => (
                <span key={badge} className="rounded-full bg-slate-100 px-2.5 py-1">{badge}</span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{selectedFeature.properties?.description || 'Quan s?t k? hi?u, v? tr? v? m?i li?n h? c?a ??i t??ng n?y v?i n?i dung b?i h?c.'}</p>
            <div className="mt-3 space-y-2">
              {Object.entries(selectedFeature.properties || {})
                .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
                .slice(0, 6)
                .map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</span>
                    <span className="text-right text-sm text-slate-700">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <AITutorPanel
        isOpen={activePanel === 'ai'}
        onClose={() => setActivePanel(null)}
        context={aiContext}
        onAssistantResponse={handleAiAssistantResponse}
      />
    </div>
  )
}

export default MapViewerPage
