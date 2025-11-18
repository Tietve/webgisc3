import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, RotateCcw, Sparkles, Loader, AlertCircle } from 'lucide-react'
import Panel from '../../ui/Panel'
import { quizService } from '@services'

/**
 * QuizPanel Component - Modern interactive quiz panel
 *
 * Features:
 * - Fetch quiz data from API
 * - Smooth question transitions with slide animations
 * - Progress bar with gradient
 * - Animated answer selection
 * - Submit to backend and get score
 * - Results screen with celebration
 * - Dark mode support
 * - Glassmorphism backdrop
 */
const QuizPanel = ({ isOpen, onClose, quizId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && quizId) {
      loadQuiz()
    }
  }, [isOpen, quizId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await quizService.get(quizId)
      setQuizData(data)
    } catch (err) {
      console.error('Error loading quiz:', err)
      setError(err.response?.data?.message || 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index)
  }

  const handleNext = async () => {
    // Save current answer
    setAnswers(prev => ({
      ...prev,
      [quizData.questions[currentQuestion].id]: selectedAnswer
    }))

    if (currentQuestion < quizData.questions.length - 1) {
      setDirection(1)
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      // Submit quiz
      await handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)

      // Include the last answer
      const finalAnswers = {
        ...answers,
        [quizData.questions[currentQuestion].id]: selectedAnswer
      }

      // Convert answers to API format
      const formattedAnswers = Object.entries(finalAnswers).map(([questionId, answerIndex]) => ({
        question_id: parseInt(questionId),
        selected_option: answerIndex
      }))

      const response = await quizService.submit(quizId, formattedAnswers)

      setScore(response.score)
      setShowResults(true)
    } catch (err) {
      console.error('Error submitting quiz:', err)
      alert(err.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1)
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers({})
    setScore(null)
    setShowResults(false)
    setDirection(1)
    loadQuiz()
  }

  if (!isOpen) return null

  // Loading state
  if (loading) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-[1002] flex items-center justify-center"
        >
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Đang tải quiz...</p>
          </div>
        </motion.div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-[1002] flex items-center justify-center"
        >
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </>
    )
  }

  if (!quizData) return null

  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      />

      {/* Quiz Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-[1002] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 shadow-lg z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {quizData.title}
              </h2>
              <p className="text-orange-100 text-sm mt-1">{quizData.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress */}
          {!showResults && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Score: {score}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait" custom={direction}>
            {!showResults ? (
              <motion.div
                key={currentQuestion}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Question */}
                <Panel variant="floating" className="p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {quizData.questions[currentQuestion].question}
                  </h3>
                </Panel>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {quizData.questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                        ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }
                      `}
                    >
                      {selectedAnswer === index && (
                        <motion.div
                          layoutId="selectedAnswer"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                            ${
                              selectedAnswer === index
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }
                          `}
                        >
                          {selectedAnswer === index && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {currentQuestion > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePrevious}
                      className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Previous
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={selectedAnswer !== null && !submitting ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer !== null && !submitting ? { scale: 0.98 } : {}}
                    onClick={handleNext}
                    disabled={selectedAnswer === null || submitting}
                    className={`
                      flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                      ${
                        selectedAnswer !== null && !submitting
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }
                    `}
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Đang nộp...
                      </>
                    ) : currentQuestion < quizData.questions.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Finish
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* Results */
              <motion.div
                key="results"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="text-center"
              >
                <Panel variant="floating" className="p-8 mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quiz Complete!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Here's how you did:</p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                    className="inline-block"
                  >
                    <div className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {score}/{quizData.questions.length}
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-700 dark:text-gray-300 font-medium"
                  >
                    {score === quizData.questions.length
                      ? 'Perfect score! You are a GIS master! 🌟'
                      : score >= quizData.questions.length / 2
                      ? 'Good job! Keep learning! 👍'
                      : 'Keep practicing! You will get better! 💪'}
                  </motion.p>
                </Panel>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRestart}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}

export default QuizPanel
