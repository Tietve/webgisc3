import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { classroomService, deadlineService, lessonService } from '@services'
import { ROUTES, getRoute } from '@constants'
import { moduleCatalog, moduleOrder } from '../data/moduleCatalog'

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
        classroomService.list(curriculumFilters),
        deadlineService.getUpcoming(),
      ])
      const lessonRows = lessonData.results || lessonData || []
      setLessons(lessonRows.filter((item) => moduleCatalog[item.module_code]))
      setClassrooms(classroomData.results || classroomData || [])
      setDeadlines(deadlineData.results || deadlineData || [])
    }

    load().catch((error) => console.error('Failed to load grade 10 hub:', error))
  }, [])

  const modules = useMemo(() => {
    const grouped = new Map(
      moduleOrder.map((code) => [
        code,
        {
          code,
          ...moduleCatalog[code],
          lessons: [],
          quizId: null,
        },
      ])
    )
    lessons.forEach((lesson) => {
      const current = grouped.get(lesson.module_code)
      if (!current) return
      current.lessons.push(lesson)
      if (!current.quizId && lesson.quiz_id) current.quizId = lesson.quiz_id
    })
    return moduleOrder.map((code) => grouped.get(code))
  }, [lessons])

  const openModuleMap = (moduleCode) => {
    navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&module=${moduleCode}&studentView=1`)
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">MVP học sinh</p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight">Địa lí 10 • Cánh Diều • Học kì 1</h1>
              <p className="mt-3 max-w-3xl text-blue-50/90">
                6 module cốt lõi để học sinh tự học, mở bài thực hành WebGIS, làm quiz và theo dõi tài nguyên được giao từ lớp.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => openModuleMap('module-05')} className="rounded-xl bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm">
                  Vào nhanh Module 05
                </button>
                <button
                  onClick={() => navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&studentView=1`)}
                  className="rounded-xl border border-white/40 px-4 py-2 font-semibold text-white"
                >
                  Mở bản đồ lớp 10
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Học sinh cần làm được gì?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  'Đọc được lớp bản đồ và chú giải trước khi trả lời câu hỏi.',
                  'Liên hệ kiến thức SGK với lớp dữ liệu quan sát trên WebGIS.',
                  'Làm quiz ngắn sau mỗi module để tự kiểm tra mức độ hiểu bài.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-blue-50">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
            <p className="text-sm text-gray-600">Mỗi module gồm bài khái quát, bài thực hành bản đồ, bộ layer cốt lõi và quiz ngắn.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <div key={module.code} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{module.code}</p>
                    <h3 className="mt-2 text-lg font-bold leading-7 text-gray-900">{module.title}</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{module.lessons.length} bài</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">{module.summary}</p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mục tiêu nhanh</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {module.learningGoals.slice(0, 3).map((goal) => (
                      <li key={goal}>• {goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(getRoute.lesson(lesson.id))}
                      className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {lesson.lesson_type === 'practice' ? 'Thực hành' : 'Tổng quan'}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => openModuleMap(module.code)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Mở map theo module
                  </button>
                  {module.quizId ? (
                    <button onClick={() => navigate(getRoute.quiz(module.quizId))} className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">
                      Làm quiz
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Bài được giao từ lớp</h2>
            <div className="mt-4 space-y-3">
              {classrooms.slice(0, 5).map((classroom) => (
                <div key={classroom.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-gray-900">{classroom.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{classroom.teacher_email} • {classroom.student_count} học sinh</p>
                </div>
              ))}
              {classrooms.length === 0 && <p className="text-sm text-gray-500">Chưa có lớp học phù hợp với bộ lọc lớp 10 HK1.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Deadline gần nhất</h2>
            <div className="mt-4 space-y-3">
              {deadlines.slice(0, 5).map((deadline) => (
                <div key={`${deadline.type || 'quiz'}-${deadline.id}`} className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">{deadline.title}</p>
                  <p className="text-sm text-amber-700">{deadline.due_date || 'Không có hạn nộp'}</p>
                </div>
              ))}
              {deadlines.length === 0 && <p className="text-sm text-gray-500">Chưa có deadline mới.</p>}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Grade10HubPage
