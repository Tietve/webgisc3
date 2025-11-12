import React from 'react'

const QuizFloatingButton = ({ onClick, hasActiveQuiz }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[1000] group"
      title="Open Quiz"
    >
      <div className="relative">
        {/* Main Button */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105">
          <span className="text-2xl">📝</span>
          <span className="font-bold text-white text-lg">Quiz</span>
        </div>

        {/* Notification Badge */}
        {hasActiveQuiz && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
      </div>
    </button>
  )
}

export default QuizFloatingButton
