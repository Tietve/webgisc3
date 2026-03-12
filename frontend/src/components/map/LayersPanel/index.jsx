import { useMemo, useState } from 'react'
import { Eye, EyeOff, Layers } from 'lucide-react'
import Panel from '../../ui/Panel'
import { getModuleCatalog, matchLayerGuide } from '@features/grade10/data/moduleCatalog'

const LayersPanel = ({ layers = [], enabledLayers = new Set(), onToggleLayer, studentView = false, moduleCode = '' }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const moduleMeta = useMemo(() => getModuleCatalog(moduleCode), [moduleCode])

  const filteredLayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return layers
    return layers.filter((layer) => [layer.name, layer.description, layer.school, layer.grade].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [layers, searchQuery])

  return (
    <div className="absolute top-24 left-1/2 z-[999] w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2">
      <Panel variant="floating" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Layers className="h-5 w-5 text-blue-600" />
            Layer quan sát
          </h3>
          <p className="mt-2 text-sm text-slate-600">Bật lần lượt các lớp cốt lõi để quan sát đúng trọng tâm của module hiện tại.</p>
        </div>

        {studentView && moduleMeta && (
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Core observation set</p>
            <div className="mt-3 space-y-2">
              {moduleMeta.essentialLayers.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs leading-5 text-slate-600">{item.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm layer theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-300"
          />
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {filteredLayers.map((layer) => {
            const isEnabled = enabledLayers.has(layer.id)
            const guide = matchLayerGuide(moduleCode, layer.name)
            return (
              <label
                key={layer.id}
                className={`block cursor-pointer rounded-2xl border px-4 py-3 transition ${isEnabled ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isEnabled} onChange={() => onToggleLayer?.(layer.id)} className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{layer.name}</p>
                        <p className="text-xs text-slate-500">{layer.description || `Layer ${layer.geom_type || layer.layer_type}`}</p>
                      </div>
                    </div>
                    {guide && (
                      <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs leading-5 text-slate-600">
                        <span className="font-semibold text-slate-700">Gợi ý quan sát:</span> {guide.purpose}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 pt-1">
                    {isEnabled ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>
              </label>
            )
          })}
          {filteredLayers.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Không tìm thấy layer phù hợp.</p>}
        </div>
      </Panel>
    </div>
  )
}

export default LayersPanel
