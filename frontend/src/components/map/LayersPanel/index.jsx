import React from 'react'

const LayersPanel = ({ layers = [], enabledLayers = new Set(), onToggleLayer }) => {
  const handleToggle = (layerId, currentlyEnabled) => {
    if (onToggleLayer) {
      onToggleLayer(layerId, !currentlyEnabled)
    }
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-80 animate-slide-down">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🗺️</span>
          Lớp bản đồ
        </h3>
        <div className="space-y-3">
          {layers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Đang tải layers...
            </p>
          ) : (
            layers.map((layer) => {
              const isEnabled = enabledLayers.has(layer.id)
              return (
                <label
                  key={layer.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggle(layer.id, isEnabled)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{layer.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {layer.description || `Layer ${layer.layer_type}`}
                    </p>
                  </div>
                </label>
              )
            })
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
            Quản lý Layers
          </button>
        </div>
      </div>
    </div>
  )
}

export default LayersPanel
