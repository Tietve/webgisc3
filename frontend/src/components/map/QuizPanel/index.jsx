import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, ArrowLeft, ArrowRight, Trophy, RotateCcw, Loader, AlertCircle } from 'lucide-react'
import Panel from '../../ui/Panel'
import { quizService } from '@services'

const QuizPanel = ({ isOpen, onClose, quizId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || !quizId) return

    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await quizService.get(quizId)
        setQuizData(data)
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setAnswers({})
        setScore(null)
        setShowResults(false)
      } catch (err) {
        console.error('Error loading quiz:', err)
        setError(err.response?.data?.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [isOpen, quizId])

  const currentItem = quizData?.questions?.[currentQuestion]
  const progress = useMemo(() => {
    if (!quizData?.questions?.length) return 0
    return ((currentQuestion + 1) / quizData.questions.length) * 100
  }, [currentQuestion, quizData])

  useEffect(() => {
    if (!currentItem) {
      setSelectedAnswer(null)
      return
    }

    setSelectedAnswer(answers[currentItem.id] ?? null)
  }, [currentItem, answers])

  const persistCurrentAnswer = () => {
    if (!currentItem || selectedAnswer === null) return answers
    return {
      ...answers,
      [currentItem.id]: selectedAnswer,
    }
  }

  const handleNext = async () => {
    const nextAnswers = persistCurrentAnswer()
    setAnswers(nextAnswers)

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      return
    }

    try {
      setSubmitting(true)
      const formattedAnswers = Object.fromEntries(
        Object.entries(nextAnswers).map(([questionId, answerId]) => [questionId, String(answerId)])
      )
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
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleRestart = async () => {
    if (!quizId) return
    try {
      setLoading(true)
      setError(null)
      const data = await quizService.get(quizId)
      setQuizData(data)
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setAnswers({})
      setScore(null)
      setShowResults(false)
    } catch (err) {
      console.error('Error reloading quiz:', err)
      setError(err.response?.data?.message || 'Failed to reload quiz')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-[1002] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-lg font-bold">{quizData?.title || 'Quiz'}</h2>
            {!showResults && quizData?.questions?.length ? (
              <div className="mt-2 text-sm text-white/90 flex items-center justify-between gap-3">
                <span>C?u {currentQuestion + 1}/{quizData.questions.length}</span>
                {score !== null && (
                  <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{score}</span>
                )}
              </div>
            ) : null}
            {!showResults && quizData?.questions?.length ? (
              <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                <motion.div className="bg-white h-full rounded-full" animate={{ width: `${progress}%` }} />
              </div>
            ) : null}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">?ang t?i quiz...</p>
              </div>
            </div>
          ) : error ? (
            <Panel variant="floating" className="p-6 border border-red-200 dark:border-red-900">
              <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Kh?ng t?i ???c quiz</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </Panel>
          ) : showResults ? (
            <div className="space-y-6">
              <Panel variant="floating" className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ho?n th?nh quiz</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">?i?m c?a b?n</p>
                <div className="text-5xl font-extrabold text-blue-600 mb-2">{score}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thang ?i?m 100</p>
              </Panel>
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> L?m l?i
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                >
                  ??ng
                </button>
              </div>
            </div>
          ) : currentItem ? (
            <div>
              <Panel variant="floating" className="p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentItem.question_text}</h3>
              </Panel>

              <div className="space-y-3 mb-6">
                {currentItem.answers.map((answer) => (
                  <motion.button
                    key={answer.id}
                    onClick={() => setSelectedAnswer(answer.id)}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedAnswer === answer.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === answer.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedAnswer === answer.id ? <CheckCircle className="w-4 h-4 text-white" /> : null}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{answer.answer_text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                {currentQuestion > 0 ? (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" /> Tr??c
                  </button>
                ) : null}
                <button
                  onClick={handleNext}
                  disabled={selectedAnswer === null || submitting}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    selectedAnswer !== null && !submitting
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {submitting ? <Loader className="w-5 h-5 animate-spin" /> : null}
                  <span>{currentQuestion < quizData.questions.length - 1 ? 'Ti?p theo' : 'N?p b?i'}</span>
                  {!submitting ? <ArrowRight className="w-5 h-5" /> : null}
                </button>
              </div>
            </div>
          ) : (
            <Panel variant="floating" className="p-6">
              <p className="text-gray-600 dark:text-gray-400">Quiz ch?a c? c?u h?i.</p>
            </Panel>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default QuizPanel
