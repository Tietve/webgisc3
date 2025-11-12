import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { Modal, Spinner } from '@components/common'
import { useAuth } from '@hooks'
import { classroomService } from '@services'
import { USER_ROLES } from '@constants'
import { formatDate } from '@utils'

const ClassroomsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({ className: '', enrollmentCode: '' })
  const [error, setError] = useState('')

  const isTeacher = user?.role === USER_ROLES.TEACHER

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    try {
      console.log('Loading classrooms...')
      const data = await classroomService.list()
      console.log('Received classrooms data:', data)

      // Handle paginated response
      const classroomsList = Array.isArray(data) ? data : (data.results || [])
      console.log('Number of classrooms:', classroomsList.length)
      setClassrooms(classroomsList)
    } catch (error) {
      console.error('Error loading classrooms:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClassroom = async (e) => {
    e.preventDefault()
    setError('')
    try {
      console.log('Creating classroom:', formData.className)
      const result = await classroomService.create(formData.className)
      console.log('Created classroom:', result)

      console.log('Reloading classrooms...')
      await loadClassrooms()
      console.log('Classrooms reloaded')

      setShowActionModal(false)
      setShowCreateForm(false)
      setFormData({ className: '', enrollmentCode: '' })
    } catch (error) {
      console.error('Error creating classroom:', error)
      console.error('Error response:', error.response?.data)
      setError(error.response?.data?.detail || error.response?.data?.error?.message || 'Không thể tạo lớp học')
    }
  }

  const handleJoinClassroom = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await classroomService.join(formData.enrollmentCode)
      await loadClassrooms()
      setShowActionModal(false)
      setShowJoinForm(false)
      setFormData({ className: '', enrollmentCode: '' })
    } catch (error) {
      setError(error.response?.data?.detail || 'Mã tham gia không hợp lệ')
    }
  }

  const viewStudents = async (classroom) => {
    try {
      setSelectedClassroom(classroom)
      const data = await classroomService.getStudents(classroom.id)
      setStudents(data)
      setShowStudentsModal(true)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const copyEnrollmentCode = (code) => {
    navigator.clipboard.writeText(code)
    alert('Đã copy mã: ' + code)
  }

  // Generate random gradient for classroom card
  const getClassroomGradient = (id) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600',
    ]
    return gradients[id % gradients.length]
  }

  // Get random icon for classroom
  const getClassroomIcon = (id) => {
    const icons = ['🌍', '🗺️', '📚', '🏫', '📖', '🎓', '✏️', '🌏', '🌎', '📝']
    return icons[id % icons.length]
  }

  return (
    <MainLayout>
      <div className="relative">
        {/* Background Watermarks - Evenly distributed */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Row 1: 0-12% */}
          <div className="absolute top-[5%] left-[8%] w-24 h-24 opacity-70 text-6xl transform -rotate-12">✏️</div>
          <div className="absolute top-[8%] left-[50%] w-28 h-28 opacity-70 text-7xl transform rotate-15">🌍</div>
          <div className="absolute top-[6%] right-[10%] w-26 h-26 opacity-70 text-6xl transform -rotate-20">📖</div>

          {/* Row 2: 20-32% */}
          <div className="absolute top-[22%] left-[15%] w-28 h-28 opacity-70 text-7xl transform rotate-10">🗺️</div>
          <div className="absolute top-[28%] right-[18%] w-24 h-24 opacity-70 text-6xl transform -rotate-15">🎓</div>

          {/* Row 3: 40-52% */}
          <div className="absolute top-[45%] left-[10%] w-26 h-26 opacity-70 text-6xl transform rotate-20">📚</div>
          <div className="absolute top-[48%] left-[55%] w-24 h-24 opacity-70 text-6xl transform -rotate-8">🏫</div>
          <div className="absolute top-[42%] right-[12%] w-28 h-28 opacity-70 text-7xl transform rotate-12">🌏</div>

          {/* Row 4: 60-72% */}
          <div className="absolute top-[65%] left-[20%] w-28 h-28 opacity-70 text-7xl transform -rotate-18">🌍</div>
          <div className="absolute top-[68%] right-[25%] w-24 h-24 opacity-70 text-6xl transform rotate-25">📖</div>

          {/* Row 5: 80-92% */}
          <div className="absolute top-[85%] left-[12%] w-24 h-24 opacity-70 text-6xl transform rotate-15">✏️</div>
          <div className="absolute top-[88%] left-[48%] w-28 h-28 opacity-70 text-7xl transform -rotate-10">🗺️</div>
          <div className="absolute top-[82%] right-[15%] w-26 h-26 opacity-70 text-6xl transform rotate-8">🎓</div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-tight">
              Lớp học của tôi
            </h1>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Classrooms Grid */}
              {classrooms.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="group bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                      {/* Gradient Header with Icon */}
                      <div className={`relative h-32 bg-gradient-to-br ${getClassroomGradient(classroom.id)} flex items-center justify-center`}>
                        <div className="text-7xl opacity-90 transform group-hover:scale-110 transition-transform duration-300">
                          {getClassroomIcon(classroom.id)}
                        </div>
                        {/* Decorative overlay */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 truncate" title={classroom.name}>
                          {classroom.name}
                        </h3>

                        {/* Info Section */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>👨‍🏫</span>
                            <span className="truncate">{classroom.teacher_email || user?.email}</span>
                          </div>

                          {classroom.enrollment_code && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Mã:</span>
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                                {classroom.enrollment_code}
                              </span>
                              <button
                                onClick={() => copyEnrollmentCode(classroom.enrollment_code)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copy mã"
                              >
                                📋
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>👥</span>
                            <span>{classroom.student_count || 0} học sinh</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/classrooms/${classroom.id}`)}
                          className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <span>🚀</span>
                          <span>Vào Lớp học</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <span className="text-6xl mb-4">📚</span>
                  <p className="text-lg">Chưa có lớp học nào</p>
                  <p className="text-sm mt-2">
                    {isTeacher ? 'Nhấn nút + để tạo lớp học mới' : 'Nhấn nút + để tham gia lớp học'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Add Button - Top Right */}
        <button
          onClick={() => setShowActionModal(true)}
          className="fixed top-6 right-8 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:scale-110 duration-200"
        >
          <span className="text-3xl leading-none font-light">+</span>
        </button>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md m-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Tùy chọn</h3>
                <button
                  onClick={() => {
                    setShowActionModal(false)
                    setShowCreateForm(false)
                    setShowJoinForm(false)
                    setError('')
                  }}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Options */}
                {!showCreateForm && !showJoinForm && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">➕</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Tạo lớp học</h4>
                          <p className="text-sm text-gray-500">
                            Tạo một lớp học mới và mời học sinh tham gia.
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowJoinForm(true)}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🚪</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Tham gia lớp học</h4>
                          <p className="text-sm text-gray-500">
                            Tham gia một lớp học đã có bằng mã lớp.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                  <form onSubmit={handleCreateClassroom} className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Tạo lớp học mới</h4>
                    <div>
                      <label className="block text-base font-medium text-gray-900 pb-2">
                        Tên lớp học
                      </label>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 h-12 px-3 text-base"
                        placeholder="Ví dụ: GIS Cơ bản 2024"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 h-10 rounded-lg bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                      >
                        Tạo lớp
                      </button>
                    </div>
                  </form>
                )}

                {/* Join Form */}
                {showJoinForm && (
                  <form onSubmit={handleJoinClassroom} className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Tham gia lớp học</h4>
                    <div>
                      <label className="block text-base font-medium text-gray-900 pb-2">
                        Mã lớp học
                      </label>
                      <input
                        type="text"
                        value={formData.enrollmentCode}
                        onChange={(e) => setFormData({ ...formData, enrollmentCode: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 h-12 px-3 text-base"
                        placeholder="Nhập mã tham gia..."
                        maxLength={8}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowJoinForm(false)}
                        className="px-4 h-10 rounded-lg bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                      >
                        Tham gia
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Students Modal */}
        {showStudentsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl m-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Danh sách học sinh - {selectedClassroom?.name}
                </h3>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="py-3.5 px-4 font-bold text-gray-900">Email</th>
                        <th className="py-3.5 px-4 font-bold text-gray-900">Ngày tham gia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.length > 0 ? (
                        students.map((student, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {student.student_email}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {formatDate(student.enrolled_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                            Chưa có học sinh nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ClassroomsPage
