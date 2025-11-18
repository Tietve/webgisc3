import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, CheckCircle2, AlertCircle, Calendar, Award } from 'lucide-react'
import { assignmentService } from '@services'
import { useAuth } from '@hooks'

/**
 * AssignmentList Component - Display assignments with submission status
 *
 * Features:
 * - Fetch assignments from API
 * - Color-coded deadlines (green/yellow/red)
 * - Show submission status
 * - Teacher: show submission count
 * - Student: show submission status
 * - Click to view/submit assignment
 */
const AssignmentList = ({ classroomId, onAssignmentClick }) => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isTeacher = user?.role === 'teacher'

  useEffect(() => {
    loadAssignments()
  }, [classroomId])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await assignmentService.list(classroomId)
      const assignmentsList = Array.isArray(data) ? data : (data.results || [])
      setAssignments(assignmentsList)
    } catch (err) {
      console.error('Error loading assignments:', err)
      setError(err.response?.data?.message || 'Failed to load assignments')
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

  const getDeadlineColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
      case 'upcoming':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    }
  }

  const getDeadlineLabel = (status) => {
    switch (status) {
      case 'overdue':
        return 'Quá hạn'
      case 'due_soon':
        return 'Sắp đến hạn'
      case 'upcoming':
        return 'Còn thời gian'
      default:
        return 'No deadline'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSubmissionStatusBadge = (assignment) => {
    if (isTeacher) {
      // Teacher view: show submission count
      const submittedCount = assignment.submission_count || 0
      const totalStudents = assignment.total_students || 0

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {submittedCount}/{totalStudents} nộp bài
          </span>
        </div>
      )
    } else {
      // Student view: show submission status
      const status = assignment.submission_status || 'not_submitted'

      switch (status) {
        case 'submitted':
          return (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Đã nộp</span>
            </div>
          )
        case 'graded':
          return (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Đã chấm điểm</span>
            </div>
          )
        case 'late':
          return (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Nộp trễ</span>
            </div>
          )
        default:
          return (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Chưa nộp</span>
            </div>
          )
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Chưa có bài tập nào
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isTeacher ? 'Tạo bài tập đầu tiên cho lớp học' : 'Giáo viên sẽ đăng bài tập ở đây'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {assignments.map((assignment) => {
          const deadlineStatus = getDeadlineStatus(assignment.due_date)

          return (
            <motion.div
              key={assignment.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01, y: -2 }}
              onClick={() => onAssignmentClick?.(assignment.id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Assignment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {assignment.title}
                      </h4>
                    </div>
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 ml-11">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 flex-wrap ml-11">
                    {/* Deadline */}
                    {assignment.due_date && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(assignment.due_date)}</span>
                      </div>
                    )}

                    {/* Max Score */}
                    {assignment.max_score && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Award className="w-4 h-4" />
                        <span>{assignment.max_score} điểm</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Badges */}
                <div className="flex flex-col items-end gap-2">
                  {/* Deadline Status */}
                  {assignment.due_date && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDeadlineColor(deadlineStatus)}`}>
                      {getDeadlineLabel(deadlineStatus)}
                    </span>
                  )}

                  {/* Submission Status */}
                  {getSubmissionStatusBadge(assignment)}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default AssignmentList
