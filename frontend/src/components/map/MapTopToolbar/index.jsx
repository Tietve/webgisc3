const MapTopToolbar = ({ activePanel, onTogglePanel, compact = false }) => {
  const toolbarButtons = compact
    ? [
        { id: 'layers', icon: '🗺️', label: 'Layers', title: 'Lớp bản đồ' },
        { id: 'lessons', icon: '📚', label: 'Lessons', title: 'Bài học tương tác' },
        { id: 'ai', icon: '🤖', label: 'AI', title: 'AI Tutor cho học sinh' },
        { id: 'assignments', icon: '📝', label: 'Assignments', title: 'Bài được giao' },
      ]
    : [
        { id: 'tools', icon: '🛠️', label: 'Tools', title: 'Công cụ vẽ & phân tích' },
        { id: 'layers', icon: '🗺️', label: 'Layers', title: 'Lớp bản đồ' },
        { id: 'lessons', icon: '📚', label: 'Lessons', title: 'Bài học tương tác' },
        { id: 'ai', icon: '🤖', label: 'AI Tutor', title: 'AI Tutor cho học sinh' },
        { id: 'assignments', icon: '📝', label: 'Assignments', title: 'Bài tập & nộp bài' },
      ]

  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 border border-gray-200/50">
        {toolbarButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => onTogglePanel(button.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300 transform hover:scale-105
              ${
                activePanel === button.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={button.title}
          >
            <span className="text-lg">{button.icon}</span>
            <span className="font-semibold">{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MapTopToolbar
