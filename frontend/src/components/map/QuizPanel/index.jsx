import React, { useState } from 'react'

const QuizPanel = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const quizData = {
    title: 'GIS Fundamentals Quiz',
    description: 'Test your knowledge of basic GIS concepts',
    questions: [
      {
        id: 1,
        question: 'What does GIS stand for?',
        options: [
          'Geographic Information System',
          'Global Internet Service',
          'Geological Imaging Software',
          'General Information Storage',
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'Which coordinate system is most commonly used for global GPS data?',
        options: ['UTM', 'WGS84', 'State Plane', 'Mercator'],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: 'What type of geometry is used to represent a city boundary?',
        options: ['Point', 'LineString', 'Polygon', 'MultiPoint'],
        correctAnswer: 2,
      },
    ],
  }

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index)
  }

  const handleNext = () => {
    if (selectedAnswer === quizData.questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResults(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001] animate-fade-in"
        onClick={onClose}
      />

      {/* Quiz Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[1002] animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📝</span>
                {quizData.title}
              </h2>
              <p className="text-orange-100 text-sm mt-1">{quizData.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          {!showResults && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResults ? (
            <>
              {/* Question */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {quizData.questions[currentQuestion].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {quizData.questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                      `}
                      >
                        {selectedAnswer === index && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${
                    selectedAnswer !== null
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </>
          ) : (
            /* Results */
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-6 border border-green-200">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                <p className="text-gray-600 mb-4">Here's how you did:</p>
                <div className="text-5xl font-extrabold text-green-600 mb-2">
                  {score}/{quizData.questions.length}
                </div>
                <p className="text-lg text-gray-700">
                  {score === quizData.questions.length
                    ? 'Perfect score! 🌟'
                    : score >= quizData.questions.length / 2
                    ? 'Good job! 👍'
                    : 'Keep practicing! 💪'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRestart}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default QuizPanel
