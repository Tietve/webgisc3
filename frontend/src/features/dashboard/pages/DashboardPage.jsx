import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { Spinner } from '@components/common'
import { useAuth } from '@hooks'
import { classroomService, lessonService, quizService } from '@services'
import { ROUTES, getRoute } from '@constants'

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ classrooms: 0, lessons: 0, quizzes: 0 })
  const [classrooms, setClassrooms] = useState([])
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [classroomsData, lessonsData, quizzesData] = await Promise.all([
        classroomService.list(),
        lessonService.list(),
        quizService.list(),
      ])

      setClassrooms(classroomsData)
      setLessons(lessonsData.slice(0, 5))
      setQuizzes(quizzesData.slice(0, 5))

      setStats({
        classrooms: classroomsData.length,
        lessons: lessonsData.length,
        quizzes: quizzesData.length,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Đã copy mã: ' + text)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight">
            Chào mừng trở lại, {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Đây là tổng quan nhanh về nền tảng của bạn.
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Classrooms Card */}
          <div className="relative flex flex-col gap-4 rounded-xl p-6 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg">
              <span className="text-2xl">🏫</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium leading-normal">Lớp học</p>
              <p className="text-gray-900 tracking-tight text-4xl font-extrabold leading-tight">
                {stats.classrooms}
              </p>
            </div>
            <span className="text-8xl text-blue-500/10 absolute -right-4 -bottom-4 rotate-[-15deg]">
              🏫
            </span>
          </div>

          {/* Quizzes Card */}
          <div className="relative flex flex-col gap-4 rounded-xl p-6 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 text-white shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium leading-normal">Quiz</p>
              <p className="text-gray-900 tracking-tight text-4xl font-extrabold leading-tight">
                {stats.quizzes}
              </p>
            </div>
            <span className="text-8xl text-orange-500/10 absolute -right-4 -bottom-4 rotate-[-15deg]">
              📝
            </span>
          </div>
        </section>

        {/* Content Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Classrooms List */}
          <div className="flex flex-col rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-purple-600 text-2xl">🚪</span>
              <h3 className="text-gray-900 text-lg font-bold">Lớp học của tôi</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {classrooms.length > 0 ? (
                classrooms.slice(0, 3).map((classroom) => (
                  <li
                    key={classroom.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700 font-medium text-sm">
                      {classroom.name}
                    </span>
                    {classroom.enrollment_code && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-purple-100 text-purple-700 rounded-full px-2.5 py-1">
                          {classroom.enrollment_code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(classroom.enrollment_code)}
                          className="text-gray-400 hover:text-gray-700"
                          title="Copy code"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm p-3">Chưa có lớp học nào</li>
              )}
            </ul>
            <Link to={ROUTES.CLASSROOMS} className="mt-4">
              <button className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                Xem tất cả →
              </button>
            </Link>
          </div>

          {/* Quizzes List */}
          <div className="flex flex-col rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-orange-600 text-2xl">📊</span>
              <h3 className="text-gray-900 text-lg font-bold">Quiz có sẵn</h3>
            </div>
            <ul className="space-y-3">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      to={getRoute.quiz(quiz.id)}
                      className="flex items-center gap-3 text-gray-700 text-sm font-medium hover:text-orange-600 transition-colors"
                    >
                      <span className="text-orange-500 text-xl">❓</span>
                      {quiz.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">Chưa có quiz nào</li>
              )}
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl font-bold">Sẵn sàng khám phá?</h3>
            <p className="text-blue-200 mt-1">
              Đi sâu vào bản đồ tương tác và sử dụng các công cụ GIS mạnh mẽ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Link to={ROUTES.MAP} className="w-full sm:w-auto">
              <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white text-blue-600 text-base font-bold shadow-lg transition-transform hover:scale-105">
                <span className="text-xl">🗺️</span>
                <span className="truncate">Khám phá Bản đồ</span>
              </button>
            </Link>
            <Link to={ROUTES.TOOLS} className="w-full sm:w-auto">
              <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white/20 text-white text-base font-bold transition-colors hover:bg-white/30">
                <span className="text-xl">🛠️</span>
                <span className="truncate">Công cụ GIS</span>
              </button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
