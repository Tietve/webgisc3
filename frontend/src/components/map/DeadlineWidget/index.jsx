import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp, AlertCircle, CheckCircle, FileText, HelpCircle } from 'lucide-react'
import { deadlineService } from '@services'
import { useNavigate } from 'react-router-dom'

/**
 * DeadlineWidget Component - Display upcoming deadlines in map view
 *
 * Features:
 * - Fetch aggregated deadlines (assignments + quizzes)
 * - Sort by due date (nearest first)
 * - Color-code by status (green/yellow/red)
 * - Countdown timer for due_soon items
 * - Click to navigate to assignment/quiz
 * - Collapsible/expandable
 * - Filter: all, assignments only, quizzes only
 */
const DeadlineWidget = ({ className = '' }) => {
  const navigate = useNavigate()
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [filter, setFilter] = useState('all') // all, assignment, quiz

  useEffect(() => {
    loadDeadlines()

    // Refresh every minute to update countdown
    const interval = setInterval(() => {
      loadDeadlines()
    }, 60000)

    return () => clearInterval(interval)
  }, [filter])

  const loadDeadlines = async () => {
    try {
      setLoading(true)
      setError(null)

      const filterParams = filter === 'all' ? {} : { type: filter }
      const data = await deadlineService.getUpcoming(filterParams)

      const deadlinesList = Array.isArray(data) ? data : (data.results || [])
      setDeadlines(deadlinesList)
    } catch (err) {
      console.error('Error loading deadlines:', err)
      setError(err.response?.data?.message || 'Failed to load deadlines')
    } finally {
      setLoading(false)
    }
  }

  const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return 'none'

    const now = new Date()
    const deadline = new Date(dueDate)
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60)

    if (hoursUntilDeadline < 0) return 'overdue'
    if (hoursUntilDeadline < 48) return 'due_soon'
    return 'upcoming'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'due_soon':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
      case 'upcoming':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'due_soon':
        return <Clock className="w-4 h-4" />
      case 'upcoming':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <HelpCircle className="w-4 h-4" />
    }
  }

  const formatCountdown = (dueDate) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diff = deadline - now

    if (diff < 0) return 'Quá hạn'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ngày`
    } else if (hours > 0) {
      return `${hours} giờ`
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} phút`
    }
  }

  const handleDeadlineClick = (deadline) => {
    if (deadline.type === 'assignment') {
      navigate(`/classrooms/${deadline.classroom_id}?tab=classwork&assignment=${deadline.id}`)
    } else if (deadline.type === 'quiz') {
      // Navigate to quiz or open quiz panel
      navigate(`/map?quiz=${deadline.id}`)
    }
  }

  const upcomingCount = deadlines.filter(d => getDeadlineStatus(d.due_date) !== 'overdue').length
  const overdueCount = deadlines.filter(d => getDeadlineStatus(d.due_date) === 'overdue').length

  return (
    <div className={`fixed top-4 right-4 z-[998] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-80 max-w-[calc(100vw-2rem)]"
      >
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Deadline sắp tới
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
              {upcomingCount}
            </span>
            {overdueCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                {overdueCount} quá hạn
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Filter Tabs */}
              <div className="flex gap-1 px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'assignment', label: 'Bài tập' },
                  { id: 'quiz', label: 'Quiz' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`
                      px-3 py-1 rounded-md text-xs font-medium transition-all
                      ${filter === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Deadlines List */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                ) : deadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Không có deadline sắp tới
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {deadlines.map((deadline) => {
                      const status = getDeadlineStatus(deadline.due_date)

                      return (
                        <motion.div
                          key={deadline.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleDeadlineClick(deadline)}
                          className={`
                            p-3 rounded-lg cursor-pointer transition-all
                            border ${getStatusColor(status)} hover:shadow-md
                          `}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <h4 className="text-sm font-semibold truncate">
                                  {deadline.title}
                                </h4>
                              </div>
                              <p className="text-xs opacity-80">
                                {deadline.classroom_name}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                                {getStatusIcon(status)}
                                <span>{formatCountdown(deadline.due_date)}</span>
                              </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded">
                              {deadline.type === 'assignment' ? '📝' : '❓'}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default DeadlineWidget
