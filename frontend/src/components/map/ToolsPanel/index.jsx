import React from 'react'

const ToolsPanel = () => {
  const tools = [
    { icon: '🖊️', label: 'Vẽ đối tượng', description: 'Vẽ điểm, đường, vùng' },
    { icon: '📏', label: 'Đo khoảng cách', description: 'Đo khoảng cách và diện tích' },
    { icon: '🎯', label: 'Buffer Analysis', description: 'Tạo vùng đệm 1km' },
    { icon: '✂️', label: 'Cắt đối tượng', description: 'Cắt và chỉnh sửa' },
    { icon: '🗑️', label: 'Xóa tất cả', description: 'Xóa các đối tượng đã vẽ' },
  ]

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[999]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-80 animate-slide-down">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🛠️</span>
          Công cụ GIS
        </h3>
        <div className="space-y-2">
          {tools.map((tool, index) => (
            <button
              key={index}
              className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
            >
              <span className="text-2xl">{tool.icon}</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ToolsPanel
