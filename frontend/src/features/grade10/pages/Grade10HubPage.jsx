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
  { code: 'module-01', title: 'B\u1ea3n \u0111\u1ed3, GPS, b\u1ea3n \u0111\u1ed3 s\u1ed1 v\u00e0 ph\u01b0\u01a1ng ph\u00e1p bi\u1ec3u hi\u1ec7n \u0111\u1ed1i t\u01b0\u1ee3ng \u0111\u1ecba l\u00ed' },
  { code: 'module-02', title: 'Tr\u00e1i \u0110\u1ea5t, kinh v\u0129 tuy\u1ebfn, m\u00fai gi\u1edd v\u00e0 h\u1ec7 qu\u1ea3 chuy\u1ec3n \u0111\u1ed9ng' },
  { code: 'module-03', title: 'Th\u1ea1ch quy\u1ec3n, ki\u1ebfn t\u1ea1o m\u1ea3ng, n\u1ed9i l\u1ef1c v\u00e0 ngo\u1ea1i l\u1ef1c' },
  { code: 'module-04', title: 'Kh\u00ed quy\u1ec3n, nhi\u1ec7t \u0111\u1ed9, kh\u00ed \u00e1p, gi\u00f3 v\u00e0 m\u01b0a' },
  { code: 'module-05', title: 'Th\u1ee7y quy\u1ec3n, n\u01b0\u1edbc tr\u00ean l\u1ee5c \u0111\u1ecba, n\u01b0\u1edbc bi\u1ec3n v\u00e0 \u0111\u1ea1i d\u01b0\u01a1ng' },
  { code: 'module-06', title: 'Th\u1ed5 nh\u01b0\u1ee1ng, sinh quy\u1ec3n, v\u1ecf \u0111\u1ecba l\u00ed, quy lu\u1eadt \u0111\u1ecba \u0111\u1edbi v\u00e0 phi \u0111\u1ecba \u0111\u1edbi' },
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
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-100">MVP h\u1ecdc sinh</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight">\u0110\u1ecba l\u00ed 10 \u2022 C\u00e1nh Di\u1ec1u \u2022 H\u1ecdc k\u00ec 1</h1>
          <p className="mt-3 max-w-3xl text-blue-50/90">
            6 module c\u1ed1t l\u00f5i \u0111\u1ec3 h\u1ecdc sinh t\u1ef1 h\u1ecdc, m\u1edf b\u00e0i th\u1ef1c h\u00e0nh WebGIS, l\u00e0m quiz v\u00e0 theo d\u00f5i t\u00e0i nguy\u00ean \u0111\u01b0\u1ee3c giao t\u1eeb l\u1edbp.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => openModuleMap('module-05')} className="rounded-xl bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm">
              V\u00e0o nhanh Module 05
            </button>
            <button
              onClick={() => navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&studentView=1`)}
              className="rounded-xl border border-white/40 px-4 py-2 font-semibold text-white"
            >
              M\u1edf b\u1ea3n \u0111\u1ed3 l\u1edbp 10
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
              <p className="text-sm text-gray-600">M\u1ed7i module g\u1ed3m b\u00e0i kh\u00e1i qu\u00e1t, b\u00e0i th\u1ef1c h\u00e0nh b\u1ea3n \u0111\u1ed3 v\u00e0 quiz ng\u1eafn.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <div key={module.code} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{module.code}</p>
                    <h3 className="mt-2 text-lg font-bold leading-7 text-gray-900">{module.title}</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{module.lessons.length} b\u00e0i</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{module.quizId ? '\u0110\u00e3 c\u00f3 quiz c\u1ee7ng c\u1ed1 ki\u1ebfn th\u1ee9c.' : '\u0110ang c\u1eadp nh\u1eadt quiz cho module n\u00e0y.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(getRoute.lesson(lesson.id))}
                      className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {lesson.title}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => openModuleMap(module.code)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    M\u1edf map theo module
                  </button>
                  {module.quizId ? (
                    <button onClick={() => navigate(getRoute.quiz(module.quizId))} className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">
                      L\u00e0m quiz
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">B\u00e0i \u0111\u01b0\u1ee3c giao t\u1eeb l\u1edbp</h2>
            <div className="mt-4 space-y-3">
              {classrooms.slice(0, 5).map((classroom) => (
                <div key={classroom.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-gray-900">{classroom.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{classroom.teacher_email} \u2022 {classroom.student_count} h\u1ecdc sinh</p>
                </div>
              ))}
              {classrooms.length === 0 && <p className="text-sm text-gray-500">Ch\u01b0a c\u00f3 l\u1edbp h\u1ecdc ph\u00f9 h\u1ee3p v\u1edbi b\u1ed9 l\u1ecdc l\u1edbp 10 HK1.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Deadline g\u1ea7n nh\u1ea5t</h2>
            <div className="mt-4 space-y-3">
              {deadlines.slice(0, 5).map((deadline) => (
                <div key={`${deadline.type || 'quiz'}-${deadline.id}`} className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">{deadline.title}</p>
                  <p className="text-sm text-amber-700">{deadline.due_date || 'Kh\u00f4ng c\u00f3 h\u1ea1n n\u1ed9p'}</p>
                </div>
              ))}
              {deadlines.length === 0 && <p className="text-sm text-gray-500">Ch\u01b0a c\u00f3 deadline m\u1edbi.</p>}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Grade10HubPage
