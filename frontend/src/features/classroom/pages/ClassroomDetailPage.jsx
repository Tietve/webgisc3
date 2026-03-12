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
  const [studentsProgress, setStudentsProgress] = useState([])
  const [studentsProgressLoading, setStudentsProgressLoading] = useState(false)

  // Assignment states
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [showGradingInterface, setShowGradingInterface] = useState(false)

  // Check if current user is the owner of this classroom
  const isOwner = classroom?.teacher_email === user?.email

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

  useEffect(() => {
    if (activeTab === 'people' && isOwner) {
      loadStudentsProgress()
    }
  }, [activeTab, isOwner, id])

  const loadClassroom = async () => {
    try {
      const foundClassroom = await classroomService.get(id)
      setClassroom(foundClassroom)
    } catch (error) {
      console.error('Error loading classroom:', error)
      navigate('/classrooms')
    } finally {
      setLoading(false)
    }
  }

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.list(id)
      const announcementsList = Array.isArray(data) ? data : (data.results || [])
      setAnnouncements(announcementsList)

      if (user?.role === 'student') {
        const unreadAnnouncements = announcementsList.filter((announcement) => !announcement.is_read)
        if (unreadAnnouncements.length > 0) {
          await Promise.all(
            unreadAnnouncements.map((announcement) => announcementService.markRead(id, announcement.id))
          )
          setAnnouncements((current) => current.map((announcement) => ({ ...announcement, is_read: true })))
        }
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
    }
  }

  const loadStudentsProgress = async () => {
    try {
      setStudentsProgressLoading(true)
      const data = await classroomService.getStudentsProgress(id)
      const studentsList = Array.isArray(data) ? data : (data.results || [])
      setStudentsProgress(studentsList)
    } catch (error) {
      console.error('Error loading students progress:', error)
    } finally {
      setStudentsProgressLoading(false)
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
      const assignment = await assignmentService.get(id, assignmentId)
      setSelectedAssignment(assignment)

      if (!isOwner && assignment.launch_url) {
        navigate(assignment.launch_url)
        return
      }

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

  const getProgressTone = (value) => {
    if (value >= 80) return 'bg-emerald-500'
    if (value >= 50) return 'bg-amber-500'
    return 'bg-rose-500'
  }

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
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
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
                    <div className="space-y-4">
                      {studentsProgressLoading ? (
                        <p className="text-gray-500 text-sm">Đang tải tiến trình học sinh...</p>
                      ) : (
                        studentsProgress.map((student) => (
                          <div key={student.student_id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{student.student_email}</p>
                                <p className="text-sm text-slate-500">
                                  Tham gia: {new Date(student.enrolled_at).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div className="min-w-[220px]">
                                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                                  <span>Tổng tiến trình</span>
                                  <span>{student.overall_progress_percent}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-slate-200">
                                  <div
                                    className={`h-3 rounded-full ${getProgressTone(student.overall_progress_percent)}`}
                                    style={{ width: `${student.overall_progress_percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Thông báo</p>
                                <p className="mt-2 text-sm text-slate-700">Đã đọc {student.announcements_read}</p>
                                <p className="text-sm text-rose-600">Chưa đọc {student.announcements_unread}</p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Bài tập</p>
                                <p className="mt-2 text-sm text-slate-700">Đã nộp {student.assignments_submitted}/{student.assignments_total}</p>
                                <p className="text-sm text-emerald-600">Đã chấm {student.assignments_graded}</p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Bài học</p>
                                <p className="mt-2 text-sm text-slate-700">Đã học {student.lessons_started}/{student.lessons_total}</p>
                                <p className="text-sm text-blue-600">Hoàn thành {student.lessons_completed}</p>
                                <p className="text-sm text-slate-500">TB tiến độ {student.average_lesson_progress}%</p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Quiz</p>
                                <p className="mt-2 text-sm text-slate-700">Đã làm {student.quizzes_submitted}/{student.quizzes_total}</p>
                                <p className="text-sm text-amber-600">
                                  Điểm TB {student.average_quiz_score ?? 'Chưa có'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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
      </div>
    </MainLayout>
  )
}

export default ClassroomDetailPage
