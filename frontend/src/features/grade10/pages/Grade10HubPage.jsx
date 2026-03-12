import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { classroomService, deadlineService, lessonService } from '@services'
import { ROUTES, getRoute } from '@constants'

const curriculumFilters = {
  grade_level: '10',
  semester: '1',
  textbook_series: 'canh-dieu',
}

const Grade10HubPage = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [deadlines, setDeadlines] = useState([])

  useEffect(() => {
    const load = async () => {
      const [lessonData, classroomData, deadlineData] = await Promise.all([
        lessonService.list(curriculumFilters),
        classroomService.list(),
        deadlineService.getUpcoming(),
      ])
      setLessons(lessonData.results || lessonData || [])
      setClassrooms((classroomData.results || classroomData || []).filter((item) => item.grade_level === '10' && item.textbook_series === 'canh-dieu'))
      setDeadlines(deadlineData.results || deadlineData || [])
    }
    load().catch((error) => console.error('Failed to load grade 10 hub:', error))
  }, [])

  const modules = useMemo(() => {
    const map = new Map()
    lessons.forEach((lesson) => {
      const current = map.get(lesson.module_code) || { code: lesson.module_code, title: lesson.module_code, lessons: [], quizId: null }
      current.title = lesson.title.split(' - ')[0]
      current.lessons.push(lesson)
      if (!current.quizId && lesson.quiz_id) current.quizId = lesson.quiz_id
      map.set(lesson.module_code, current)
    })
    return Array.from(map.values())
  }, [lessons])

  const openModuleMap = (moduleCode) => {
    navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&module=${moduleCode}&studentView=1`)
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-100">MVP học sinh</p>
          <h1 className="mt-2 text-4xl font-black">Địa lí 10 - Cánh Diều - Học kì 1</h1>
          <p className="mt-3 max-w-3xl text-blue-100">Học theo module, mở bài thực hành WebGIS, làm quiz củng cố, và xem bài được giao từ lớp trong cùng một luồng.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => openModuleMap('module-04')} className="rounded-xl bg-white px-4 py-2 font-semibold text-blue-700">Vào nhanh Module 04</button>
            <button onClick={() => navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&studentView=1`)} className="rounded-xl border border-white/40 px-4 py-2 font-semibold text-white">Mở bản đồ lớp 10</button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <div key={module.code} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{module.code}</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{module.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{module.lessons.length} bài học • {module.quizId ? 'Có quiz' : 'Chưa có quiz'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {module.lessons.map((lesson) => (
                    <button key={lesson.id} onClick={() => navigate(getRoute.lesson(lesson.id))} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                      {lesson.lesson_type === 'practice' ? 'Thực hành' : 'Tổng quan'}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openModuleMap(module.code)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Mở map</button>
                  {module.quizId && <button onClick={() => navigate(getRoute.quiz(module.quizId))} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700">Làm quiz</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Tiếp tục học</h2>
            <div className="mt-4 space-y-3">
              {lessons.slice(0, 4).map((lesson) => (
                <button key={lesson.id} onClick={() => navigate(getRoute.lesson(lesson.id))} className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left hover:bg-gray-100">
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{lesson.title}</span>
                    <span className="text-xs text-gray-500">{lesson.step_count} bước • {lesson.module_code}</span>
                  </span>
                  <span className="text-blue-600">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Bài được giao từ lớp</h2>
            <div className="mt-4 space-y-3">
              {deadlines.slice(0, 5).map((deadline) => (
                <div key={`${deadline.type || 'quiz'}-${deadline.id}`} className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{deadline.title}</p>
                  <p className="text-xs text-gray-500">{deadline.classroom_name || 'Lớp học'} • hạn {new Date(deadline.due_date).toLocaleString('vi-VN')}</p>
                </div>
              ))}
              {deadlines.length === 0 && <p className="text-sm text-gray-500">Chưa có deadline gần.</p>}
              {classrooms.length > 0 && (
                <button onClick={() => navigate(ROUTES.CLASSROOMS)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Mở lớp học của tôi</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Grade10HubPage


