import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { useAuth } from '@hooks'
import { classroomService, announcementService, assignmentService } from '@services'
import AssignmentList from '@components/classroom/AssignmentList'
import SubmissionForm from '@components/classroom/SubmissionForm'
import GradingInterface from '@components/classroom/GradingInterface'

const ClassroomDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stream') // stream, classwork, people
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)

  // Assignment states
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [showGradingInterface, setShowGradingInterface] = useState(false)

  // Assignment creation modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: 100,
    attachment: null
  })
  const [creatingAssignment, setCreatingAssignment] = useState(false)

  useEffect(() => {
    loadClassroom()
    loadAnnouncements()

    // Check URL params for tab and assignment
    const tab = searchParams.get('tab')
    const assignmentId = searchParams.get('assignment')

    if (tab) {
      setActiveTab(tab)
    }

    if (assignmentId && tab === 'classwork') {
      handleAssignmentClick(parseInt(assignmentId))
    }
  }, [id, searchParams])

  const loadClassroom = async () => {
    try {
      // For now, we'll fetch from the list and find the matching one
      const data = await classroomService.list()
      const classroomsList = Array.isArray(data) ? data : (data.results || [])
      const foundClassroom = classroomsList.find(c => c.id === parseInt(id))

      if (foundClassroom) {
        setClassroom(foundClassroom)
      } else {
        // Classroom not found, redirect back
        navigate('/classrooms')
      }
    } catch (error) {
      console.error('Error loading classroom:', error)
      navigate('/classrooms')
    } finally {
      setLoading(false)
    }
  }

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true)
      const data = await announcementService.list(id)
      const announcementsList = Array.isArray(data) ? data : (data.results || [])
      setAnnouncements(announcementsList)
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoadingAnnouncements(false)
    }
  }

  const handleCreateAnnouncement = async (content) => {
    try {
      const newAnnouncement = await announcementService.create(id, content)
      setAnnouncements([newAnnouncement, ...announcements])
      setShowAnnouncementModal(false)
      setAnnouncementText('')
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('Không thể tạo thông báo. Vui lòng thử lại.')
    }
  }

  // Assignment handlers
  const handleAssignmentClick = async (assignmentId) => {
    try {
      const assignment = await assignmentService.get(assignmentId)
      setSelectedAssignment(assignment)

      if (isOwner) {
        setShowGradingInterface(true)
      } else {
        // Check if student already submitted
        if (assignment.submission_status === 'not_submitted') {
          setShowSubmissionForm(true)
        } else {
          // Show assignment detail (could create a separate view)
          setShowSubmissionForm(false)
        }
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
      alert('Không thể tải bài tập. Vui lòng thử lại.')
    }
  }

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false)
    setSelectedAssignment(null)
    // Could show success message or refresh assignment list
  }

  const handleCloseAssignmentView = () => {
    setSelectedAssignment(null)
    setShowSubmissionForm(false)
    setShowGradingInterface(false)
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()

    if (!assignmentForm.title || !assignmentForm.due_date) {
      alert('Vui lòng điền đầy đủ thông tin bài tập')
      return
    }

    try {
      setCreatingAssignment(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', assignmentForm.title)
      formData.append('description', assignmentForm.description)
      formData.append('due_date', assignmentForm.due_date)
      formData.append('max_score', assignmentForm.max_score)

      if (assignmentForm.attachment) {
        formData.append('attachment', assignmentForm.attachment)
      }

      await assignmentService.create(id, formData)

      // Reset form and close modal
      setAssignmentForm({
        title: '',
        description: '',
        due_date: '',
        max_score: 100,
        attachment: null
      })
      setShowAssignmentModal(false)

      // Refresh assignment list (AssignmentList component will reload)
      // Trigger a small state change to force AssignmentList to reload
      setActiveTab('classwork')
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Không thể tạo bài tập. Vui lòng thử lại.')
    } finally {
      setCreatingAssignment(false)
    }
  }

  const handleAssignmentFormChange = (field, value) => {
    setAssignmentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file PDF, DOC, DOCX')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File không được vượt quá 10MB')
        return
      }
      setAssignmentForm(prev => ({ ...prev, attachment: file }))
    }
  }

  // Check if current user is the owner of this classroom
  const isOwner = classroom?.teacher_email === user?.email

  // Generate random gradient for classroom header (same function as ClassroomsPage)
  const getClassroomGradient = (classroomId) => {
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
    return gradients[classroomId % gradients.length]
  }

  const getClassroomIcon = (classroomId) => {
    const icons = ['🌍', '🗺️', '📚', '🏫', '📖', '🎓', '✏️', '🌏', '🌎', '📝']
    return icons[classroomId % icons.length]
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!classroom) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-500 mb-4">Không tìm thấy lớp học</p>
            <button
              onClick={() => navigate('/classrooms')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        {/* Gradient Header with Classroom Name */}
        <div className={`relative bg-gradient-to-br ${getClassroomGradient(classroom.id)} rounded-lg p-8 mb-6 text-white overflow-hidden mx-6 mt-6`}>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold relative z-10">{classroom.name}</h1>
            {isOwner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30">
                👑 Quản lý
              </span>
            )}
          </div>
          <p className="text-white/90 text-sm relative z-10">
            {isOwner ? 'Bạn là người tạo lớp học này' : `Giáo viên: ${classroom.teacher_email}`}
          </p>
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <span className="text-[160px]">{getClassroomIcon(classroom.id)}</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <nav className="container mx-auto px-6">
            <div className="flex items-center justify-center">
              <button
                onClick={() => setActiveTab('stream')}
                className={`relative px-3 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'stream'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Bảng tin
              </button>
              <button
                onClick={() => setActiveTab('classwork')}
                className={`px-3 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'classwork'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Bài tập trên lớp
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`px-3 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'people'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Mọi người
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6 flex-grow">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'stream' && (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Sidebar - Upcoming */}
                <div className="w-full md:w-1/4 order-2 md:order-1">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="font-medium text-base text-gray-900 mb-2">Sắp đến hạn</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Tuyệt vời, không có bài tập nào sắp đến hạn!
                    </p>
                    <button className="w-full text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-full transition-colors">
                      Xem tất cả
                    </button>
                  </div>
                </div>

                {/* Right Content - Stream */}
                <div className="w-full md:w-3/4 order-1 md:order-2 space-y-6">
                  {/* Announce Something - Only show for owner */}
                  {isOwner && (
                    <div
                      onClick={() => setShowAnnouncementModal(true)}
                      className="shadow-md rounded-lg bg-white p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-blue-100 p-2 rounded-full">
                        <span className="text-2xl text-blue-600">✏️</span>
                      </div>
                      <span className="text-sm text-gray-500">Thông báo mới...</span>
                    </div>
                  )}

                  {/* Announcements List or Empty State */}
                  {announcements.length > 0 ? (
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {announcement.author_email?.charAt(0).toUpperCase() || 'T'}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{announcement.author_email}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(announcement.created_at).toLocaleDateString('vi-VN', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {isOwner && (
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                  <span className="text-xl">⋮</span>
                                </button>
                              )}
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                              {announcement.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                      <div className="text-6xl mb-4 opacity-50">{getClassroomIcon(classroom.id)}</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài đăng nào</h3>
                      <p className="text-gray-500">
                        {isOwner
                          ? 'Bắt đầu thảo luận bằng cách đăng thông báo đầu tiên'
                          : 'Chưa có thông báo nào từ giáo viên'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'classwork' && (
              <div className="space-y-6">
                {/* Assignment Detail View */}
                {selectedAssignment && showSubmissionForm && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-4">
                      <button
                        onClick={handleCloseAssignmentView}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        ← Quay lại danh sách
                      </button>
                    </div>
                    <SubmissionForm
                      assignment={selectedAssignment}
                      onSubmitSuccess={handleSubmissionSuccess}
                      onCancel={handleCloseAssignmentView}
                    />
                  </div>
                )}

                {/* Grading Interface (Teacher) */}
                {selectedAssignment && showGradingInterface && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <button
                        onClick={handleCloseAssignmentView}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        ← Quay lại danh sách
                      </button>
                    </div>
                    <GradingInterface
                      assignment={selectedAssignment}
                      onClose={handleCloseAssignmentView}
                    />
                  </div>
                )}

                {/* Assignment List */}
                {!selectedAssignment && (
                  <>
                    {/* Create Assignment Button - Only show for owner */}
                    {isOwner && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowAssignmentModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <span className="text-xl">➕</span>
                          <span className="font-medium">Tạo bài tập</span>
                        </button>
                      </div>
                    )}

                    {/* Assignments List */}
                    <AssignmentList
                      classroomId={id}
                      onAssignmentClick={handleAssignmentClick}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'people' && (
              <div className="space-y-6">
                {/* Teacher Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Giáo viên</h3>
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {classroom.teacher_email?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{classroom.teacher_email}</p>
                      <p className="text-sm text-gray-500">Giáo viên</p>
                    </div>
                  </div>
                </div>

                {/* Students Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Học sinh</h3>
                    <span className="text-blue-600 font-medium">{classroom.student_count || 0}</span>
                  </div>
                  {classroom.student_count === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-4xl mb-2">👥</p>
                      <p>Chưa có học sinh nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Student list will be loaded here */}
                      <p className="text-gray-500 text-sm">Đang tải danh sách học sinh...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Thông báo mới</h3>
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false)
                    setAnnouncementText('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung thông báo
                  </label>
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Nhập nội dung thông báo cho lớp học..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAnnouncementModal(false)
                      setAnnouncementText('')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleCreateAnnouncement(announcementText)}
                    disabled={!announcementText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Đăng thông báo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Creation Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">📝 Tạo bài tập mới</h3>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false)
                    setAssignmentForm({
                      title: '',
                      description: '',
                      due_date: '',
                      max_score: 100,
                      attachment: null
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => handleAssignmentFormChange('title', e.target.value)}
                    placeholder="VD: Bài tập về bản đồ địa hình"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => handleAssignmentFormChange('description', e.target.value)}
                    placeholder="Mô tả chi tiết về bài tập..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Due Date & Max Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn nộp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={assignmentForm.due_date}
                      onChange={(e) => handleAssignmentFormChange('due_date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm tối đa
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.max_score}
                      onChange={(e) => handleAssignmentFormChange('max_score', parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tài liệu đính kèm (PDF, DOC, DOCX - tối đa 10MB)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                        {assignmentForm.attachment ? (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <span>📄</span>
                            <span className="text-sm font-medium">{assignmentForm.attachment.name}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <span className="text-2xl">📎</span>
                            <p className="text-sm mt-1">Nhấp để chọn file</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                    </label>
                    {assignmentForm.attachment && (
                      <button
                        type="button"
                        onClick={() => setAssignmentForm(prev => ({ ...prev, attachment: null }))}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignmentModal(false)
                      setAssignmentForm({
                        title: '',
                        description: '',
                        due_date: '',
                        max_score: 100,
                        attachment: null
                      })
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!assignmentForm.title || !assignmentForm.due_date || creatingAssignment}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {creatingAssignment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Tạo bài tập
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ClassroomDetailPage
