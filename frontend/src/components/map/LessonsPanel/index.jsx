import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Layers3, Loader2 } from 'lucide-react'
import Panel from '../../ui/Panel'
import { lessonService } from '@services'
import { getModuleCatalog } from '@features/grade10/data/moduleCatalog'

const LessonsPanel = ({ onLessonSelect, filters = {}, studentView = false, moduleCode = '' }) => {
  const [selectedModule, setSelectedModule] = useState(moduleCode || 'all')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSelectedModule(moduleCode || 'all')
  }, [moduleCode])

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await lessonService.list(filters)
        const lessonRows = Array.isArray(data) ? data : (data.results || [])
        setLessons(lessonRows)
      } catch (err) {
        console.error('Error loading lessons:', err)
        setError('Không thể tải danh sách bài học')
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [JSON.stringify(filters)])

  const moduleMeta = useMemo(() => getModuleCatalog(moduleCode), [moduleCode])

  const modules = useMemo(() => {
    const codes = Array.from(new Set(lessons.map((lesson) => lesson.module_code).filter(Boolean)))
    return [{ id: 'all', label: 'Tất cả' }, ...codes.map((code) => ({ id: code, label: code.toUpperCase() }))]
  }, [lessons])

  const filteredLessons = useMemo(() => {
    if (selectedModule === 'all') return lessons
    return lessons.filter((lesson) => lesson.module_code === selectedModule)
  }, [lessons, selectedModule])

  return (
    <div className="absolute top-24 left-1/2 z-[999] w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2">
      <Panel variant="floating" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Bài học theo module
          </h3>
          <p className="mt-2 text-sm text-slate-600">Chọn bài tổng quan trước, sau đó mở bài thực hành để quan sát layer trên bản đồ.</p>
        </div>

        {studentView && moduleMeta && (
          <div className="mb-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{moduleCode}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{moduleMeta.summary}</p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${selectedModule === module.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {module.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải bài học...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {filteredLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect?.(lesson.id)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-2xl p-3 text-white ${lesson.lesson_type === 'practice' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {lesson.lesson_type === 'practice' ? <Layers3 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{lesson.module_code}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{lesson.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{lesson.lesson_type === 'practice' ? 'Thực hành' : 'Tổng quan'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{lesson.step_count} bước</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredLessons.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Chưa có bài học phù hợp.</p>}
          </div>
        )}
      </Panel>
    </div>
  )
}

export default LessonsPanel
