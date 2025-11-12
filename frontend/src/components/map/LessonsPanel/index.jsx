import React from 'react'

const LessonsPanel = () => {
  const lessons = [
    {
      id: 1,
      title: 'Introduction to GIS',
      description: 'Learn the basics of Geographic Information Systems',
      duration: '15 min',
      difficulty: 'Beginner',
      icon: '📍',
    },
    {
      id: 2,
      title: 'Map Reading & Interpretation',
      description: 'Understanding map elements and symbols',
      duration: '20 min',
      difficulty: 'Beginner',
      icon: '🗺️',
    },
    {
      id: 3,
      title: 'Coordinate Systems',
      description: 'Learn about WGS84, UTM, and projections',
      duration: '25 min',
      difficulty: 'Intermediate',
      icon: '🌐',
    },
    {
      id: 4,
      title: 'Spatial Analysis',
      description: 'Buffer, intersect, and overlay operations',
      duration: '30 min',
      difficulty: 'Advanced',
      icon: '🎯',
    },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'Advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-96 animate-slide-down max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📚</span>
          Bài học tương tác
        </h3>
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 border border-transparent hover:border-blue-200 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{lesson.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      ⏱️ {lesson.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LessonsPanel
