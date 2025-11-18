import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, Download, Send, Loader, AlertCircle } from 'lucide-react'
import { assignmentService, submissionService } from '@services'

/**
 * GradingInterface Component - Teacher grading interface
 *
 * Features:
 * - Show all submissions for assignment
 * - Display student name, submission time, late flag
 * - Show submission content (text + file download)
 * - Grade form (score + feedback)
 * - Show who hasn't submitted
 * - Bulk view of all submissions
 */
const GradingInterface = ({ assignment, onClose }) => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [grading, setGrading] = useState(false)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    loadSubmissions()
  }, [assignment.id])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await assignmentService.getSubmissions(assignment.id)
      const submissionsList = Array.isArray(data) ? data : (data.results || [])
      setSubmissions(submissionsList)

      // Auto-select first ungraded submission
      const firstUngraded = submissionsList.find(s => !s.score && s.status !== 'not_submitted')
      if (firstUngraded) {
        setSelectedSubmission(firstUngraded)
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError(err.response?.data?.message || 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault()

    if (!selectedSubmission || !score) {
      return
    }

    try {
      setGrading(true)

      const gradeData = {
        score: parseFloat(score),
        feedback: feedback.trim() || null
      }

      const updatedSubmission = await submissionService.grade(selectedSubmission.id, gradeData)

      // Update submissions list
      setSubmissions(submissions.map(s =>
        s.id === updatedSubmission.id ? updatedSubmission : s
      ))

      // Clear form
      setScore('')
      setFeedback('')

      // Select next ungraded submission
      const nextUngraded = submissions.find(s =>
        s.id !== selectedSubmission.id && !s.score && s.status !== 'not_submitted'
      )
      setSelectedSubmission(nextUngraded || null)
    } catch (err) {
      console.error('Error grading submission:', err)
      alert(err.response?.data?.message || 'Failed to grade submission')
    } finally {
      setGrading(false)
    }
  }

  const submittedCount = submissions.filter(s => s.status !== 'not_submitted').length
  const gradedCount = submissions.filter(s => s.score !== null && s.score !== undefined).length
  const notSubmittedStudents = submissions.filter(s => s.status === 'not_submitted')

  const getSubmissionStatusColor = (submission) => {
    if (submission.status === 'not_submitted') {
      return 'text-gray-400 dark:text-gray-600'
    }
    if (submission.score !== null && submission.score !== undefined) {
      return 'text-green-600 dark:text-green-400'
    }
    if (submission.is_late) {
      return 'text-orange-600 dark:text-orange-400'
    }
    return 'text-blue-600 dark:text-blue-400'
  }

  const getSubmissionStatusIcon = (submission) => {
    if (submission.status === 'not_submitted') {
      return <XCircle className="w-4 h-4" />
    }
    if (submission.score !== null && submission.score !== undefined) {
      return <CheckCircle className="w-4 h-4" />
    }
    return <Clock className="w-4 h-4" />
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Submissions List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bài nộp
            </h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">Đã nộp</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {submittedCount}/{submissions.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
              <p className="text-xs text-green-600 dark:text-green-400">Đã chấm</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {gradedCount}/{submittedCount}
              </p>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {submissions.map((submission) => (
              <motion.button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                whileHover={{ scale: 1.02 }}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${selectedSubmission?.id === submission.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {submission.student_name || submission.student_email}
                  </span>
                  <span className={getSubmissionStatusColor(submission)}>
                    {getSubmissionStatusIcon(submission)}
                  </span>
                </div>
                {submission.status !== 'not_submitted' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}
                    {submission.is_late && (
                      <span className="text-orange-600 dark:text-orange-400 ml-1">(Trễ)</span>
                    )}
                  </p>
                )}
                {submission.score !== null && submission.score !== undefined && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Điểm: {submission.score}/{assignment.max_score}
                  </p>
                )}
              </motion.button>
            ))}
          </div>

          {/* Not Submitted Students */}
          {notSubmittedStudents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chưa nộp ({notSubmittedStudents.length}):
              </p>
              <div className="space-y-1">
                {notSubmittedStudents.map((student) => (
                  <p key={student.id} className="text-xs text-gray-500 dark:text-gray-400">
                    • {student.student_name || student.student_email}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Submission Detail & Grading Form */}
      <div className="lg:col-span-2">
        {selectedSubmission ? (
          selectedSubmission.status === 'not_submitted' ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Học sinh này chưa nộp bài
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              {/* Student Info */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedSubmission.student_name || selectedSubmission.student_email}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Nộp lúc: {new Date(selectedSubmission.submitted_at).toLocaleString('vi-VN')}
                  </span>
                  {selectedSubmission.is_late && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      ⚠️ Nộp trễ
                    </span>
                  )}
                </div>
              </div>

              {/* Submission Content */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Câu trả lời:
                </h4>
                {selectedSubmission.text_answer ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedSubmission.text_answer}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Không có câu trả lời văn bản
                  </p>
                )}
              </div>

              {/* File Download */}
              {selectedSubmission.file_submission && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    File đính kèm:
                  </h4>
                  <a
                    href={selectedSubmission.file_submission}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Tải xuống file</span>
                  </a>
                </div>
              )}

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmit} className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Điểm số (/{assignment.max_score})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={assignment.max_score}
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={`0 - ${assignment.max_score}`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    disabled={grading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học sinh..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                    disabled={grading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!score || grading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {grading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Chấm điểm</span>
                    </>
                  )}
                </button>
              </form>

              {/* Previous Grade (if exists) */}
              {selectedSubmission.score !== null && selectedSubmission.score !== undefined && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    ✅ Đã chấm điểm
                  </p>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <p>Điểm: {selectedSubmission.score}/{assignment.max_score}</p>
                    {selectedSubmission.feedback && (
                      <p className="mt-1">Nhận xét: {selectedSubmission.feedback}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Chọn một bài nộp để chấm điểm
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GradingInterface
