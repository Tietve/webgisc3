import React, { useState } from 'react'

const LayersPanel = () => {
  const [layers, setLayers] = useState([
    { id: 1, name: 'Vietnam Provinces', description: 'Ranh giới tỉnh thành VN', enabled: true },
    { id: 2, name: 'Points of Interest', description: 'Trường học, bệnh viện, hồ...', enabled: false },
    { id: 3, name: 'Roads & Routes', description: 'Tuyến đường, bus, metro', enabled: false },
    { id: 4, name: 'Administrative Boundaries', description: 'Ranh giới hành chính', enabled: false },
  ])

  const toggleLayer = (id) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
    ))
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-80 animate-slide-down">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🗺️</span>
          Lớp bản đồ
        </h3>
        <div className="space-y-3">
          {layers.map((layer) => (
            <label
              key={layer.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layer.enabled}
                onChange={() => toggleLayer(layer.id)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{layer.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{layer.description}</p>
              </div>
            </label>
          ))}
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
