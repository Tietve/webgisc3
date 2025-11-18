import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, MapPin, Route, Square, Circle, Eye, EyeOff, Settings } from 'lucide-react'
import Panel from '../../ui/Panel'
import CollapsibleSection from '../../ui/CollapsibleSection'

/**
 * LayersPanel Component - Modern layer management panel
 *
 * Features:
 * - Glassmorphism design with backdrop blur
 * - Collapsible layer categories
 * - Smooth toggle animations
 * - Lucide icons for visual clarity
 * - Dark mode support
 */
const LayersPanel = ({ layers = [], enabledLayers = new Set(), onToggleLayer }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleToggle = (layerId, currentlyEnabled) => {
    if (onToggleLayer) {
      onToggleLayer(layerId, !currentlyEnabled)
    }
  }

  // Group layers by type
  const groupedLayers = layers.reduce((acc, layer) => {
    const type = layer.layer_type || 'Other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(layer)
    return acc
  }, {})

  // Filter layers by search query
  const filteredLayers = searchQuery
    ? layers.filter(layer =>
        layer.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  // Get icon for layer type
  const getLayerIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'point':
        return MapPin
      case 'line':
      case 'linestring':
        return Route
      case 'polygon':
      case 'multipolygon':
        return Square
      default:
        return Circle
    }
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'point':
        return MapPin
      case 'line':
        return Route
      case 'polygon':
        return Square
      default:
        return Layers
    }
  }

  const renderLayerItem = (layer) => {
    const isEnabled = enabledLayers.has(layer.id)
    const LayerIcon = getLayerIcon(layer.layer_type)

    return (
      <motion.label
        key={layer.id}
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-blue-50/70 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={() => handleToggle(layer.id, isEnabled)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
          />
          <LayerIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {layer.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {layer.description || `Layer ${layer.layer_type}`}
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isEnabled ? 1 : 0 }}
          className="flex-shrink-0"
        >
          {isEnabled ? (
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          )}
        </motion.div>
      </motion.label>
    )
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <Panel variant="floating" className="p-6 w-96 max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Lớp bản đồ
          </h3>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm layer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Layers className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Layers */}
        <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {layers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 dark:text-gray-400 text-sm text-center py-8"
            >
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Đang tải layers...</p>
            </motion.div>
          ) : filteredLayers ? (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredLayers.map(renderLayerItem)}
              </AnimatePresence>
              {filteredLayers.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 dark:text-gray-400 text-sm text-center py-4"
                >
                  Không tìm thấy layer
                </motion.p>
              )}
            </div>
          ) : (
            Object.entries(groupedLayers).map(([category, categoryLayers]) => (
              <CollapsibleSection
                key={category}
                title={`${category} (${categoryLayers.length})`}
                icon={getCategoryIcon(category.toLowerCase())}
                defaultOpen={true}
              >
                {categoryLayers.map(renderLayerItem)}
              </CollapsibleSection>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Quản lý Layers
          </motion.button>
        </div>
      </Panel>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  )
}

export default LayersPanel
