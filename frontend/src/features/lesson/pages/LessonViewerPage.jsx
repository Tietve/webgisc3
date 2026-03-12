import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import lessonService from '@services/lesson.service'
import gisService from '@services/gis.service'
import MapboxMap from '@components/map/MapboxMap'
import AITutorPanel from '@components/ai/AITutorPanel'
import { getModuleCatalog, matchLayerGuide } from '@features/grade10/data/moduleCatalog'
import { buildFeaturePopupHTML, getFeatureAnchor, getFeatureBounds, getFeatureDisplayName, getLayerVisualSpec, getLegendVisualMeta } from '@features/map/utils/layerPresentation'

const LessonViewerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const [lesson, setLesson] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)

  // Track which layers are currently active on the map
  const activeLayers = useRef(new Set())

  useEffect(() => {
    loadLesson()
  }, [id])

  // Execute map action when step changes or map becomes ready
  useEffect(() => {
    if (mapReady && lesson && lesson.steps[currentStep]) {
      executeMapAction(lesson.steps[currentStep].map_action)
    }
  }, [currentStep, mapReady, lesson])

  const loadLesson = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await lessonService.get(id)
      setLesson(data)
    } catch (err) {
      setError(err.message || 'Không thể tải bài học')
    } finally {
      setLoading(false)
    }
  }

  const handleMapLoad = useCallback(() => {
    setMapReady(true)
  }, [])

  const removeLayerFromMap = useCallback((layerId) => {
    if (!mapRef.current) return
    mapRef.current.removeClickHandler(`layer-${layerId}`)
    mapRef.current.removeClickHandler(`layer-${layerId}-fill`)
    mapRef.current.removeLayer(`layer-${layerId}`)
    mapRef.current.removeLayer(`layer-${layerId}-label`)
    mapRef.current.removeLayer(`layer-${layerId}-fill`)
    mapRef.current.removeLayer(`layer-${layerId}-outline`)
    mapRef.current.removeSource(`layer-${layerId}`)
  }, [])

  const addLayerToMap = useCallback((layerId, featuresData, options = {}) => {
    if (!mapRef.current || !featuresData.features || featuresData.features.length === 0) return

    const layerMeta = (lesson?.layers || []).find((item) => item.id === layerId) || {}
    const firstFeature = featuresData.features[0]
    const geomType = firstFeature.geometry.type
    const spec = getLayerVisualSpec({ layerName: layerMeta.name, geomType })

    mapRef.current.addGeoJSONSource(`layer-${layerId}`, featuresData)

    const handleFeatureClick = (feature) => {
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
      mapRef.current.addClickHandler(`layer-${layerId}`, handleFeatureClick)
    } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: spec.paint,
      })
      mapRef.current.addClickHandler(`layer-${layerId}`, handleFeatureClick)
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
      mapRef.current.addClickHandler(`layer-${layerId}-fill`, handleFeatureClick)
    }

    const bounds = getFeatureBounds(featuresData)
    if (options.fitBounds && bounds) {
      mapRef.current.fitBounds(bounds, { padding: 72, maxZoom: options.maxZoom ?? 7 })
    }
  }, [lesson])

  const executeMapAction = useCallback(async (mapAction) => {
    if (!mapAction || !mapRef.current) return

    const { payload = {} } = mapAction
    const boundsToMerge = []

    if (payload.layers_off === 'all') {
      activeLayers.current.forEach((lid) => removeLayerFromMap(lid))
      activeLayers.current.clear()
    } else if (Array.isArray(payload.layers_off)) {
      payload.layers_off.forEach((lid) => {
        removeLayerFromMap(lid)
        activeLayers.current.delete(lid)
      })
    }

    if (Array.isArray(payload.layers_on)) {
      for (const lid of payload.layers_on) {
        try {
          const featuresData = await gisService.getFeatures(lid)
          if (featuresData?.features?.length) {
            if (!activeLayers.current.has(lid)) {
              addLayerToMap(lid, featuresData, { fitBounds: false })
              activeLayers.current.add(lid)
            }
            const bounds = getFeatureBounds(featuresData)
            if (bounds) boundsToMerge.push(bounds)
          }
        } catch (err) {
          console.error(`Failed to load layer ${lid}:`, err)
        }
      }
    }

    if (payload.fit_to_layers && boundsToMerge.length > 0) {
      const merged = boundsToMerge.reduce((acc, bounds) => {
        if (!acc) return [...bounds]
        return [
          [Math.min(acc[0][0], bounds[0][0]), Math.min(acc[0][1], bounds[0][1])],
          [Math.max(acc[1][0], bounds[1][0]), Math.max(acc[1][1], bounds[1][1])],
        ]
      }, null)

      if (merged) {
        mapRef.current.fitBounds(merged, { padding: 72, maxZoom: payload.max_zoom ?? 7 })
      }
    }

    if (mapAction.action_type === 'flyTo' && payload.center && !payload.fit_to_layers) {
      const map = mapRef.current.getMap()
      if (map) {
        map.flyTo({
          center: payload.center,
          zoom: payload.zoom ?? 2,
          pitch: payload.pitch ?? 0,
          bearing: payload.bearing ?? 0,
          duration: 2000,
        })
      }
    }
  }, [addLayerToMap, removeLayerFromMap])

  const nextStep = () => {
    if (lesson && currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const finishLesson = () => {
    if (lesson?.quiz_id) {
      navigate(`/quiz/${lesson.quiz_id}`)
      return
    }
    navigate('/grade-10')
  }

  const formatMarkdown = (text) => {
    if (!text) return ''
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br/>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Không thể mở bài học</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error || 'Bài học không tồn tại hoặc chưa được xuất bản.'}</p>
          <button
            onClick={() => navigate('/grade-10')}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Quay lại grade 10
          </button>
        </div>
      </div>
    )
  }

  const step = lesson.steps[currentStep]
  const isLastStep = currentStep === lesson.steps.length - 1
  const progress = ((currentStep + 1) / lesson.steps.length) * 100
  const isAiSupported = lesson.grade_level === '10' && lesson.semester === '1' && lesson.textbook_series === 'canh-dieu'
  const relatedLayers = (lesson.layers || []).slice(0, 5)
  const moduleMeta = getModuleCatalog(lesson.module_code)
  const activeStepLayerIds = new Set(step?.map_action?.payload?.layers_on || [])
  const guidedLayers = relatedLayers.map((layer) => ({
    ...layer,
    guide: matchLayerGuide(lesson.module_code, layer.name),
    visualMeta: getLegendVisualMeta({ layerName: layer.name, geomType: layer.geom_type || layer.layer_type }),
    isActiveForStep: activeStepLayerIds.has(layer.id),
  }))
  const map = mapRef.current?.getMap?.()
  const aiContext = {
    lesson_id: lesson.id,
    quiz_id: lesson.quiz_id || undefined,
    classroom_id: undefined,
    lesson_step: currentStep,
    active_layers: Array.from(activeLayers.current),
    selected_feature: undefined,
    map_state: map
      ? {
          center: [Number(map.getCenter().lng.toFixed(6)), Number(map.getCenter().lat.toFixed(6))],
          zoom: Number(map.getZoom().toFixed(2)),
          pitch: Number(map.getPitch().toFixed(2)),
          bearing: Number(map.getBearing().toFixed(2)),
        }
      : undefined,
    grade_level: lesson.grade_level,
    semester: lesson.semester,
    textbook_series: lesson.textbook_series,
    module_code: lesson.module_code,
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/95 px-4 py-3 flex items-center justify-between shrink-0 z-10 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/grade-10')}
            className="shrink-0 rounded-lg p-1.5 transition hover:bg-slate-100"
            title={'Quay lại'}
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{lesson.module_code?.replace('-', ' ').toUpperCase()}</p>
            <h1 className="truncate text-lg font-bold text-slate-900">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lesson.quiz_id && (
            <button
              onClick={() => navigate(`/quiz/${lesson.quiz_id}`)}
              className="hidden rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 md:inline-flex"
            >
              Mở quiz
            </button>
          )}
          {isAiSupported && (
            <button
              onClick={() => setIsAiOpen((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                isAiOpen ? 'bg-violet-600 text-white hover:bg-violet-700' : 'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50'
              }`}
            >
              <span>✨</span>
              {isAiOpen ? 'Ẩn AI Tutor' : 'Hỏi AI Tutor'}
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Map section */}
        <div className="relative h-[45vh] lg:h-auto lg:flex-1">
          <MapboxMap
            ref={mapRef}
            initialCenter={lesson.module_center || [106, 16]}
            initialZoom={lesson.module_zoom || 4}
            onMapLoad={handleMapLoad}
          />

          {/* Step indicator */}
          <div className="absolute top-4 left-4 z-10 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tiến độ</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Bước {currentStep + 1} / {lesson.steps.length}</p>
          </div>

          {/* Selected feature info */}
          {selectedFeature && (
            <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Đối tượng đang xem</p>
              <h3 className="mt-1 text-sm font-bold text-slate-900">{getFeatureDisplayName(selectedFeature.properties)}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{selectedFeature.layer_name}</p>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="w-full shrink-0 bg-white lg:w-[460px] xl:w-[520px] flex flex-col border-t lg:border-l lg:border-t-0 border-slate-200">
          <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 md:p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Bước học hiện tại</p>
                      <h2 className="mt-1 text-xl font-bold leading-tight text-slate-900">{step.title || `Bước ${currentStep + 1}`}</h2>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                      {Math.round(progress)}%
                    </div>
                  </div>
                  {lesson.description && currentStep === 0 && (
                    <p className="mt-3 text-sm leading-6 text-slate-700">{lesson.description}</p>
                  )}
                </div>

                {moduleMeta?.keyConcepts?.length > 0 && currentStep === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Khái niệm cốt lõi</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {moduleMeta.keyConcepts.map((concept) => (
                        <span key={concept} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {guidedLayers.length > 0 && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Layer quan sát chính</p>
                    <div className="mt-3 space-y-3">
                      {guidedLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className={`rounded-2xl border px-3 py-3 shadow-sm transition ${layer.isActiveForStep ? 'border-emerald-200 bg-white ring-2 ring-emerald-100' : 'border-slate-200 bg-white/90'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                              {layer.visualMeta.preview === 'line' ? (
                                <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: layer.visualMeta.palette.base }} />
                              ) : layer.visualMeta.preview === 'polygon' ? (
                                <div
                                  className="h-6 w-9 rounded-md border-2"
                                  style={{ backgroundColor: layer.visualMeta.palette.soft, borderColor: layer.visualMeta.palette.dark }}
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span
                                    className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: layer.visualMeta.palette.base }}
                                  />
                                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nhãn</span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-emerald-950">{layer.name}</p>
                                <span
                                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                                  style={{ backgroundColor: layer.visualMeta.palette.soft }}
                                >
                                  {layer.visualMeta.label}
                                </span>
                                {layer.isActiveForStep && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    Đang bật ở bước này
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                {layer.guide?.purpose || layer.description || 'Dùng để quan sát mối liên hệ với nội dung bài học.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 md:p-5 shadow-sm text-slate-800">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Nhiệm vụ quan sát</p>
                  <div
                    className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-0 prose-h2:text-xl prose-h2:mb-2 prose-h3:text-lg prose-h3:mb-2 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-blue-700 prose-li:text-slate-700 prose-em:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(step.popup_text) }}
                  />
                </div>

                {moduleMeta && (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Câu hỏi tự kiểm tra</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {moduleMeta.observationChecklist.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}
          <div className="shrink-0 border-t border-slate-200 bg-white/90 p-3 space-y-2.5">
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {'Trước'}
              </button>

              {isLastStep ? (
                <button
                  onClick={finishLesson}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-1.5 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {'Hoàn thành'}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-1.5"
                >
                  {'Tiếp theo'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AITutorPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        context={aiContext}
      />
    </div>
  )
}

export default LessonViewerPage
