import React, { useState, useCallback } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * FileUpload Component - Drag & drop file upload with validation
 *
 * Features:
 * - Drag & drop + click to upload
 * - File preview with name, size
 * - Client-side validation (file type, size)
 * - Progress indicator (if needed)
 * - Remove file button
 * - Dark mode support
 *
 * Props:
 * - accept: string - Accepted file types (e.g., '.pdf,.doc,.docx')
 * - maxSize: number - Max file size in bytes (default: 10MB)
 * - onFileSelect: function - Callback when file is selected
 * - onFileRemove: function - Callback when file is removed
 * - disabled: boolean - Disable upload
 * - error: string - Error message to display
 */
const FileUpload = ({
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  onFileRemove,
  disabled = false,
  error = null,
}) => {
  const [file, setFile] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [validationError, setValidationError] = useState(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelect = useCallback((selectedFile) => {
    if (disabled) return

    const error = validateFile(selectedFile)

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    setFile(selectedFile)

    if (onFileSelect) {
      onFileSelect(selectedFile)
    }
  }, [disabled, maxSize, accept, onFileSelect])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, handleFileSelect])

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    setValidationError(null)

    if (onFileRemove) {
      onFileRemove()
    }
  }

  const displayError = error || validationError

  return (
    <div className="w-full">
      {/* Upload Zone */}
      {!file && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${isDragActive && !disabled
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : displayError
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="pointer-events-none">
            <motion.div
              animate={{ y: isDragActive ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload
                className={`
                  w-12 h-12 mx-auto mb-4
                  ${displayError
                    ? 'text-red-400 dark:text-red-500'
                    : isDragActive
                    ? 'text-blue-500'
                    : 'text-gray-400 dark:text-gray-600'
                  }
                `}
              />
            </motion.div>

            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">or</p>
            <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors pointer-events-auto">
              Browse Files
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Accepted: {accept} (Max {formatFileSize(maxSize)})
            </p>
          </div>
        </div>
      )}

      {/* File Preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    onClick={handleRemove}
                    disabled={disabled}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    File ready to upload
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
