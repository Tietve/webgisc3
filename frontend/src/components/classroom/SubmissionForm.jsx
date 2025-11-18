import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import FileUpload from '../common/FileUpload'
import { submissionService } from '@services'

/**
 * SubmissionForm Component - Student assignment submission form
 *
 * Features:
 * - Text answer textarea
 * - File upload with drag & drop
 * - Validation: require at least one (text or file)
 * - Late submission warning
 * - Loading state during submission
 * - Success confirmation
 */
const SubmissionForm = ({ assignment, onSubmitSuccess, onCancel }) => {
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isLate = assignment.due_date && new Date(assignment.due_date) < new Date()
  const canSubmit = textAnswer.trim() || selectedFile

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canSubmit) {
      setError('Please provide either a text answer or upload a file')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Create FormData for multipart/form-data upload
      const formData = new FormData()

      if (textAnswer.trim()) {
        formData.append('text_answer', textAnswer.trim())
      }

      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await submissionService.submit(assignment.id, formData)

      setSuccess(true)

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess(response)
        }
      }, 1500)
    } catch (err) {
      console.error('Error submitting assignment:', err)
      setError(err.response?.data?.message || 'Failed to submit assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Nộp bài thành công!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Bài nộp của bạn đã được ghi nhận. Giáo viên sẽ chấm điểm sớm.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Late Submission Warning */}
      {isLate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Cảnh báo: Nộp trễ hạn
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Bài tập này đã quá hạn nộp. Bài nộp của bạn sẽ được đánh dấu là nộp trễ.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Assignment Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {assignment.title}
        </h4>
        {assignment.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {assignment.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {assignment.due_date && (
            <span>
              Hạn nộp: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
            </span>
          )}
          {assignment.max_score && <span>Điểm tối đa: {assignment.max_score}</span>}
        </div>
      </div>

      {/* Text Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Câu trả lời văn bản
        </label>
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          rows={8}
          disabled={submitting}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nhập câu trả lời hoặc tải file lên (hoặc cả hai)
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tải file lên (tùy chọn)
        </label>
        <FileUpload
          accept=".pdf,.doc,.docx,.txt,.zip"
          maxSize={10 * 1024 * 1024} // 10MB
          onFileSelect={setSelectedFile}
          onFileRemove={() => setSelectedFile(null)}
          disabled={submitting}
          error={error}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Đang nộp...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Nộp bài</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default SubmissionForm
