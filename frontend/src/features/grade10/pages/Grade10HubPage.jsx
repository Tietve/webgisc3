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

const moduleMeta = [
  { code: 'module-01', title: 'Bản đồ, GPS, bản đồ số và phương pháp biểu hiện đối tượng địa lí' },
  { code: 'module-02', title: 'Trái Đất, kinh vĩ tuyến, múi giờ và hệ quả chuyển động' },
  { code: 'module-03', title: 'Thạch quyển, kiến tạo mảng, nội lực và ngoại lực' },
  { code: 'module-04', title: 'Khí quyển, nhiệt độ, khí áp, gió và mưa' },
  { code: 'module-05', title: 'Thủy quyển, nước trên lục địa, nước biển và đại dương' },
  { code: 'module-06', title: 'Thổ nhưỡng, sinh quyển, vỏ địa lí, quy luật địa đới và phi địa đới' },
]

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
      setLessons(lessonRows.filter((item) => moduleMeta.some((module) => module.code === item.module_code)))
      setClassrooms(classroomData.results || classroomData || [])
      setDeadlines(deadlineData.results || deadlineData || [])
    }

    load().catch((error) => console.error('Failed to load grade 10 hub:', error))
  }, [])

  const modules = useMemo(() => {
    const grouped = new Map(moduleMeta.map((module) => [module.code, { ...module, lessons: [], quizId: null }]))
    lessons.forEach((lesson) => {
      const current = grouped.get(lesson.module_code)
      if (!current) return
      current.lessons.push(lesson)
      if (!current.quizId && lesson.quiz_id) current.quizId = lesson.quiz_id
    })
    return moduleMeta.map((module) => grouped.get(module.code))
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
          <p className="mt-3 max-w-3xl text-blue-100">6 module cốt lõi cho học sinh tự học, mở bài thực hành WebGIS, làm quiz và theo dõi tài nguyên được giao từ lớp.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => openModuleMap('module-05')} className="rounded-xl bg-white px-4 py-2 font-semibold text-blue-700">Vào nhanh Module 05</button>
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
                  {module.quizId && (
                    <button onClick={() => navigate(getRoute.quiz(module.quizId))} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700">Làm quiz</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Tiếp tục học</h2>
            <div className="mt-4 space-y-3">
              {lessons.slice(0, 6).map((lesson) => (
                <button key={lesson.id} onClick={() => navigate(getRoute.lesson(lesson.id))} className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600">{lesson.module_code}</p>
                    <p className="font-semibold text-gray-900">{lesson.title}</p>
                    <p className="text-sm text-gray-500">{lesson.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">Mở</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Bài được giao từ lớp</h2>
              <div className="mt-4 space-y-3">
                {classrooms.length === 0 && <p className="text-sm text-gray-500">Chưa có lớp HK1 nào đang hoạt động.</p>}
                {classrooms.map((classroom) => (
                  <div key={classroom.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{classroom.name}</p>
                    <p className="text-sm text-slate-500">{classroom.teacher_email} • {classroom.student_count} học sinh</p>
                  </div>
                ))}
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
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Grade10HubPage
