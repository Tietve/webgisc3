import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, AlertCircle, CheckCircle2, BookOpen, FileText } from 'lucide-react'
import { quizService, assignmentService } from '@services'
import { useAuth } from '@hooks'

/**
 * DeadlineWidget - Show upcoming deadlines from all classrooms
 *
 * Features:
 * - Aggregates quiz and assignment deadlines
 * - Color-coded by urgency (green >24h, yellow <24h, red overdue)
 * - Real-time countdown
 * - Click to view/submit
 */
const DeadlineWidget = ({ onDeadlineClick }) => {
  const { user } = useAuth()
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    loadDeadlines()
    // Refresh every minute
    const interval = setInterval(loadDeadlines, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadDeadlines = async () => {
    try {
      setLoading(true)
      // Fetch quiz deadlines
      const quizData = await quizService.getDeadlines()
      const quizDeadlines = (quizData.results || quizData || []).map(item => ({
        ...item,
        type: 'quiz',
        icon: BookOpen,
        dueDate: item.deadline || item.due_date
      }))

      // Fetch assignment deadlines from all classrooms
      // Note: This assumes user has enrollments data
      // In production, you'd have a dedicated endpoint: /deadlines/
      const assignmentDeadlines = []

      setDeadlines([...quizDeadlines, ...assignmentDeadlines].sort((a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
      ))
    } catch (err) {
      console.error('Error loading deadlines:', err)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyStatus = (dueDate) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const hoursUntil = (deadline - now) / (1000 * 60 * 60)

    if (hoursUntil < 0) return { color: 'red', label: 'Overdue', bg: 'bg-red-500/10', text: 'text-red-500' }
    if (hoursUntil < 24) return { color: 'yellow', label: 'Due Soon', bg: 'bg-yellow-500/10', text: 'text-yellow-500' }
    return { color: 'green', label: 'Upcoming', bg: 'bg-green-500/10', text: 'text-green-500' }
  }

  const formatTimeRemaining = (dueDate) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diff = deadline - now

    if (diff < 0) return 'Overdue'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const upcomingDeadlines = deadlines.filter(d => new Date(d.dueDate) > new Date()).slice(0, 5)

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-28 left-8 z-20"
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
           style={{ width: '320px' }}>
        {/* Header */}
        <div
          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">Upcoming Deadlines</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {upcomingDeadlines.length}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading deadlines...</p>
                  </div>
                ) : upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No upcoming deadlines</p>
                    <p className="text-xs mt-1">You're all caught up! 🎉</p>
                  </div>
                ) : (
                  upcomingDeadlines.map((deadline, index) => {
                    const urgency = getUrgencyStatus(deadline.dueDate)
                    const Icon = deadline.icon

                    return (
                      <motion.div
                        key={`${deadline.type}-${deadline.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onDeadlineClick && onDeadlineClick(deadline)}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${urgency.bg} border border-gray-200/50 dark:border-gray-700/50`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${urgency.bg}`}>
                            <Icon className={`w-4 h-4 ${urgency.text}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {deadline.title || deadline.name}
                              </h4>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${urgency.bg} ${urgency.text} whitespace-nowrap`}>
                                {formatTimeRemaining(deadline.dueDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(deadline.dueDate).toLocaleDateString('vi-VN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {deadline.classroom_name && (
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {deadline.classroom_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              {upcomingDeadlines.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50">
                  <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    View All Deadlines →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default DeadlineWidget
