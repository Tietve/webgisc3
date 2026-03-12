import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import lessonService from '@services/lesson.service'
import gisService from '@services/gis.service'
import MapboxMap from '@components/map/MapboxMap'
import AITutorPanel from '@components/ai/AITutorPanel'

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
      setError(err.message || 'Kh?ng th? t?i b?i h?c')
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
    mapRef.current.removeLayer(`layer-${layerId}-fill`)
    mapRef.current.removeLayer(`layer-${layerId}-outline`)
    mapRef.current.removeSource(`layer-${layerId}`)
  }, [])

  const addLayerToMap = useCallback((layerId, featuresData) => {
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
    } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
      mapRef.current.addLayer({
        id: `layer-${layerId}`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: {
          'line-color': '#667eea',
          'line-width': 3
        }
      })
    } else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
      mapRef.current.addLayer({
        id: `layer-${layerId}-fill`,
        type: 'fill',
        source: `layer-${layerId}`,
        paint: {
          'fill-color': '#f5576c',
          'fill-opacity': 0.3
        }
      })
      mapRef.current.addLayer({
        id: `layer-${layerId}-outline`,
        type: 'line',
        source: `layer-${layerId}`,
        paint: {
          'line-color': '#f5576c',
          'line-width': 2
        }
      })
    }
  }, [])

  const executeMapAction = useCallback(async (mapAction) => {
    if (!mapAction || !mapRef.current) return

    const { payload } = mapAction

    // Handle layers_off
    if (payload.layers_off === 'all') {
      activeLayers.current.forEach((lid) => removeLayerFromMap(lid))
      activeLayers.current.clear()
    } else if (Array.isArray(payload.layers_off)) {
      payload.layers_off.forEach((lid) => {
        removeLayerFromMap(lid)
        activeLayers.current.delete(lid)
      })
    }

    // Handle layers_on
    if (Array.isArray(payload.layers_on)) {
      for (const lid of payload.layers_on) {
        if (activeLayers.current.has(lid)) continue
        try {
          const featuresData = await gisService.getFeatures(lid)
          if (featuresData.features) {
            addLayerToMap(lid, featuresData)
            activeLayers.current.add(lid)
          }
        } catch (err) {
          console.error(`Failed to load layer ${lid}:`, err)
        }
      }
    }

    // Handle flyTo
    if (mapAction.action_type === 'flyTo' && payload.center) {
      const map = mapRef.current.getMap()
      if (map) {
        map.flyTo({
          center: payload.center,
          zoom: payload.zoom ?? 2,
          pitch: payload.pitch ?? 0,
          bearing: payload.bearing ?? 0,
          duration: 2000
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

  // --- Loading state ---
  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">?ang t?i b?i h?c...</p>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-400 text-4xl mb-4">!</div>
          <h2 className="text-xl font-bold text-white mb-2">L?i</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay l?i b?n ??
          </button>
        </div>
      </div>
    )
  }

  // --- Empty lesson ---
  if (!lesson || !lesson.steps || lesson.steps.length === 0) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">B?i h?c ch?a c? n?i dung</h2>
          <p className="text-gray-300 mb-6">
            B?i h?c n?y ch?a ???c c?p nh?t n?i dung. Vui l?ng ch?n b?i h?c kh?c.
          </p>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay l?i b?n ??
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/grade-10')}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition shrink-0"
            title="Quay l?i"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-white truncate">{lesson.title}</h1>
        </div>
        <div className="text-xs text-gray-400 shrink-0 ml-3">
          B??c {currentStep + 1}/{lesson.steps.length}
        </div>
        <button
          onClick={() => isAiSupported && setIsAiOpen(true)}
          disabled={!isAiSupported}
          className={`ml-3 px-3 py-1.5 text-xs font-semibold rounded-full transition ${
            isAiSupported ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          AI Tutor
        </button>
      </div>

      {/* Main split-screen */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Map panel (left / top on mobile) */}
        <div className="lg:w-[65%] w-full h-[45vh] lg:h-full relative shrink-0">
          <MapboxMap
            ref={mapRef}
            initialCenter={[105.8342, 21.0278]}
            initialZoom={3}
            onMapLoad={handleMapLoad}
          />
        </div>

        {/* Content panel (right / bottom on mobile) */}
        <div className="lg:w-[35%] w-full flex-1 lg:flex-none lg:h-full flex flex-col bg-slate-900 border-l border-slate-700">
          {/* Scrollable step content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="p-5 md:p-6 space-y-4"
              >
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Bước {currentStep + 1}</p>
                      <h2 className="mt-1 text-lg font-semibold text-white">{lesson.lesson_type === 'practice' ? 'Thực hành với WebGIS' : 'Khám phá kiến thức cốt lõi'}</h2>
                    </div>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-200">
                      {lesson.module_code}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{lesson.description}</p>
                </div>

                {relatedLayers.length > 0 && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Layer quan sát chính</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {relatedLayers.map((layer) => (
                        <span key={layer.id} className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
                          {layer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 md:p-5 shadow-inner">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Nhiệm vụ quan sát</p>
                  <div
                    className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-white prose-headings:font-bold
                    prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-0
                    prose-h2:text-xl prose-h2:mb-2
                    prose-h3:text-lg prose-h3:mb-2
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-blue-400
                    prose-li:text-gray-300
                    prose-em:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(step.popup_text) }}
                />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}
          <div className="shrink-0 border-t border-gray-700 p-3 space-y-2.5">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
                className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tr??c
              </button>

              {isLastStep ? (
                <button
                  onClick={finishLesson}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-1.5 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ho?n th?nh
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-1.5"
                >
                  Ti?p theo
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
        title="AI Tutor theo b?i h?c"
      />
    </div>
  )
}

// Simple markdown formatter
const formatMarkdown = (text) => {
  if (!text) return ''

  // Extract and preserve HTML img tags before processing
  const imgPlaceholders = []
  let processed = text.replace(/<img\s+[^>]*>/gi, (match) => {
    const idx = imgPlaceholders.length
    imgPlaceholders.push(
      `<div class="my-4 text-center">${match.replace(/<img/, '<img style="max-width:100%;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:inline-block"')}</div>`
    )
    return `%%IMG_PLACEHOLDER_${idx}%%`
  })

  // Parse markdown tables before line-level replacements
  processed = processed.replace(
    /((?:^\|.+\|[ \t]*\n)+)/gm,
    (tableBlock) => {
      const rows = tableBlock.trim().split('\n').filter(r => r.trim())
      if (rows.length < 2) return tableBlock

      // Check if second row is separator
      const isSeparator = /^\|[\s\-:|]+\|$/.test(rows[1].trim())
      const dataStart = isSeparator ? 2 : 1

      const parseRow = (row) =>
        row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

      const headerCells = parseRow(rows[0])
      let html = '<div class="my-4 overflow-x-auto"><table class="w-full border-collapse text-sm">'
      html += '<thead><tr>'
      headerCells.forEach(cell => {
        html += `<th class="border border-gray-600 bg-gray-700 px-3 py-2 text-left text-gray-200 font-semibold">${cell}</th>`
      })
      html += '</tr></thead><tbody>'

      for (let i = dataStart; i < rows.length; i++) {
        const cells = parseRow(rows[i])
        const rowBg = (i - dataStart) % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
        html += '<tr>'
        cells.forEach(cell => {
          html += `<td class="border border-gray-600 ${rowBg} px-3 py-2 text-gray-300">${cell}</td>`
        })
        html += '</tr>'
      }
      html += '</tbody></table></div>'
      return html
    }
  )

  processed = processed
    // Images with caption: ![alt](url) followed by *caption*
    .replace(/!\[([^\]]*)\]\(([^)]+)\)\s*\n\*([^*]+)\*/g,
      '<div class="my-4 text-center"><img src="$2" alt="$1" style="max-width:100%;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:inline-block" /><p class="text-sm text-gray-400 mt-2 italic">$3</p></div>')
    // Images without explicit caption: ![alt](url) — use alt as caption
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<div class="my-4 text-center"><img src="$2" alt="$1" style="max-width:100%;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:inline-block" /><p class="text-sm text-gray-400 mt-2 italic">$1</p></div>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 bg-blue-900/20 p-3 my-3 italic text-gray-300">$1</blockquote>')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold, italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-400">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Lists
    .replace(/^- (.*$)/gim, '<li class="ml-6">$1</li>')
    // Newlines
    .replace(/\n/g, '<br>')

  // Restore HTML img placeholders
  imgPlaceholders.forEach((html, idx) => {
    processed = processed.replace(`%%IMG_PLACEHOLDER_${idx}%%`, html)
  })

  return processed
}

export default LessonViewerPage
