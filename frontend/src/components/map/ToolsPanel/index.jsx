import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Pencil, Ruler, MapPin, Circle, Square, Scissors, Trash2, GitMerge, Sparkles } from 'lucide-react'
import Panel from '../../ui/Panel'
import CollapsibleSection from '../../ui/CollapsibleSection'

/**
 * ToolsPanel Component - Modern GIS tools panel
 *
 * Features:
 * - Categorized tools (Draw, Measure, Analyze, Edit)
 * - Active tool indicator with glow effect
 * - Smooth hover animations
 * - Lucide icons for clarity
 * - Dark mode support
 */
const ToolsPanel = ({ activeTool, onToolSelect }) => {
  const [selectedTool, setSelectedTool] = useState(activeTool || null)

  const handleToolClick = (toolId) => {
    setSelectedTool(toolId)
    if (onToolSelect) {
      onToolSelect(toolId)
    }
  }

  const toolCategories = [
    {
      id: 'draw',
      title: 'Vẽ đối tượng',
      icon: Pencil,
      tools: [
        { id: 'draw-point', icon: MapPin, label: 'Vẽ điểm', description: 'Đánh dấu vị trí trên bản đồ' },
        { id: 'draw-line', icon: Ruler, label: 'Vẽ đường', description: 'Vẽ đường nối giữa các điểm' },
        { id: 'draw-polygon', icon: Square, label: 'Vẽ vùng', description: 'Vẽ vùng đa giác' },
        { id: 'draw-circle', icon: Circle, label: 'Vẽ hình tròn', description: 'Vẽ vùng hình tròn' },
      ],
    },
    {
      id: 'measure',
      title: 'Đo đạc',
      icon: Ruler,
      tools: [
        { id: 'measure-distance', icon: Ruler, label: 'Đo khoảng cách', description: 'Đo khoảng cách giữa các điểm' },
        { id: 'measure-area', icon: Square, label: 'Đo diện tích', description: 'Đo diện tích vùng' },
      ],
    },
    {
      id: 'analyze',
      title: 'Phân tích',
      icon: Sparkles,
      tools: [
        { id: 'buffer', icon: Circle, label: 'Tạo vùng đệm', description: 'Tạo vùng đệm xung quanh đối tượng' },
        { id: 'intersect', icon: GitMerge, label: 'Giao điểm', description: 'Tìm vùng giao giữa các đối tượng' },
      ],
    },
    {
      id: 'edit',
      title: 'Chỉnh sửa',
      icon: Scissors,
      tools: [
        { id: 'edit-cut', icon: Scissors, label: 'Cắt đối tượng', description: 'Cắt và chỉnh sửa đối tượng' },
        { id: 'clear-all', icon: Trash2, label: 'Xóa tất cả', description: 'Xóa tất cả đối tượng đã vẽ' },
      ],
    },
  ]

  const renderToolButton = (tool) => {
    const isActive = selectedTool === tool.id
    const Icon = tool.icon

    return (
      <motion.button
        key={tool.id}
        onClick={() => handleToolClick(tool.id)}
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
          ${
            isActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
              : 'border-transparent bg-gray-50/50 dark:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700'
          }
        `}
      >
        {/* Active glow effect */}
        {isActive && (
          <motion.div
            layoutId="activeToolGlow"
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex items-start gap-3 w-full">
          <div
            className={`
            p-2 rounded-lg transition-colors
            ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }
          `}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p
              className={`font-semibold transition-colors ${
                isActive
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
            >
              {tool.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tool.description}</p>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <Panel variant="floating" className="p-6 w-96 max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Công cụ GIS
          </h3>
          {selectedTool && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-blue-600 dark:text-blue-400 mt-1"
            >
              Công cụ đang chọn: {selectedTool}
            </motion.p>
          )}
        </div>

        {/* Tool Categories */}
        <div className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {toolCategories.map((category) => {
            const CategoryIcon = category.icon
            return (
              <CollapsibleSection
                key={category.id}
                title={category.title}
                icon={CategoryIcon}
                defaultOpen={true}
              >
                <div className="space-y-2">
                  {category.tools.map(renderToolButton)}
                </div>
              </CollapsibleSection>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>Click vào công cụ để sử dụng</span>
          </div>
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

export default ToolsPanel
