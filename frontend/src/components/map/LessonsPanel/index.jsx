import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Clock, Star, CheckCircle2, MapPin, Map, Globe, Target, Filter, Loader, AlertCircle } from 'lucide-react'
import Panel from '../../ui/Panel'
import CollapsibleSection from '../../ui/CollapsibleSection'
import { lessonService } from '@services'

/**
 * LessonsPanel Component - Interactive lessons panel
 *
 * Features:
 * - Fetch lessons from API
 * - Difficulty-based filtering
 * - Progress indicators
 * - Smooth card animations on hover
 * - Lucide icons for visual hierarchy
 * - Dark mode support
 * - Loading and error states
 */
const LessonsPanel = ({ onLessonSelect }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Icon mapping for lessons
  const iconMap = {
    'MapPin': MapPin,
    'Map': Map,
    'Globe': Globe,
    'Target': Target,
    'BookOpen': BookOpen,
  }

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await lessonService.list()
      const lessonsList = Array.isArray(data) ? data : (data.results || [])

      // Map lessons to include icon and color
      const mappedLessons = lessonsList.map((lesson, index) => ({
        ...lesson,
        icon: iconMap[lesson.icon] || BookOpen,
        color: getColorGradient(index),
      }))

      setLessons(mappedLessons)
    } catch (err) {
      console.error('Error loading lessons:', err)
      setError(err.response?.data?.message || 'Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const getColorGradient = (index) => {
    const gradients = [
      'from-green-400 to-emerald-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-teal-400 to-blue-500',
      'from-yellow-400 to-orange-500',
    ]
    return gradients[index % gradients.length]
  }

  const difficulties = [
    { id: 'all', label: 'Tất cả', color: 'bg-gray-500' },
    { id: 'Beginner', label: 'Cơ bản', color: 'bg-green-500' },
    { id: 'Intermediate', label: 'Trung bình', color: 'bg-yellow-500' },
    { id: 'Advanced', label: 'Nâng cao', color: 'bg-red-500' },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const filteredLessons =
    selectedDifficulty === 'all'
      ? lessons
      : lessons.filter((lesson) => lesson.difficulty === selectedDifficulty)

  const renderLessonCard = (lesson) => {
    const Icon = lesson.icon

    return (
      <motion.div
        key={lesson.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={() => onLessonSelect?.(lesson.id)}
        className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group overflow-hidden"
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${lesson.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`} />

        {/* Completed badge */}
        {lesson.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1"
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        )}

        <div className="flex items-start gap-3 relative z-10">
          {/* Icon */}
          <div className={`p-3 rounded-xl bg-gradient-to-br ${lesson.color} text-white flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
              {lesson.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {lesson.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar (if started) */}
        {lesson.completed && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500"
          />
        )}
      </motion.div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
        <Panel variant="floating" className="p-6 w-[28rem] max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </Panel>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
        <Panel variant="floating" className="p-6 w-[28rem] max-w-[calc(100vw-2rem)]">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadLessons}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <Panel variant="floating" className="p-6 w-[28rem] max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Bài học tương tác
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Hoàn thành</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {lessons.filter((l) => l.completed).length}/{lessons.length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Điểm tích lũy</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                125
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <CollapsibleSection title="Lọc theo độ khó" icon={Filter} defaultOpen={true}>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <motion.button
                key={difficulty.id}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    selectedDifficulty === difficulty.id
                      ? `${difficulty.color} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {difficulty.label}
              </motion.button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Lessons List */}
        <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredLessons.length > 0 ? (
              filteredLessons.map(renderLessonCard)
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 dark:text-gray-400 text-sm text-center py-8"
              >
                Không có bài học nào
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Hiển thị {filteredLessons.length} bài học</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Xem tất cả →
            </motion.button>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default LessonsPanel
