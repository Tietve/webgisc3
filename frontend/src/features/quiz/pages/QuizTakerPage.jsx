import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { quizService } from '@services'
import { ROUTES } from '@constants'

const QuizTakerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    quizService.get(id)
      .then((data) => setQuiz(data))
      .catch((error) => console.error('Failed to load quiz:', error))
      .finally(() => setLoading(false))
  }, [id])

  const answeredCount = useMemo(() => {
    if (!quiz?.questions) return 0
    return quiz.questions.filter((question) => answers[String(question.id)]).length
  }, [answers, quiz])

  const isComplete = useMemo(() => {
    if (!quiz?.questions) return false
    return quiz.questions.every((question) => answers[String(question.id)])
  }, [answers, quiz])

  const progress = useMemo(() => {
    if (!quiz?.questions?.length) return 0
    return Math.round((answeredCount / quiz.questions.length) * 100)
  }, [answeredCount, quiz])

  const handleSubmit = async () => {
    const result = await quizService.submit(Number(id), answers)
    setSubmitted(result)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">?ang t?i quiz...</div>
  if (!quiz) return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">Kh?ng t?m th?y quiz.</div>

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-xl">
          <button onClick={() => navigate(ROUTES.GRADE_10)} className="mb-4 text-sm text-blue-100 hover:text-white">
            ? Quay l?i hub l?p 10
          </button>
          <p className="text-xs uppercase tracking-[0.25em] text-blue-100">{quiz.module_code}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">{quiz.title}</h1>
          <p className="mt-2 max-w-3xl text-blue-50/90">{quiz.description}</p>
          <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-blue-50">
              <span>Ti?n ?? l?m b?i</span>
              <span>{answeredCount}/{quiz.questions.length} c?u</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {submitted && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">N?p b?i th?nh c?ng</p>
            <p className="mt-1 text-3xl font-black text-emerald-900">?i?m: {submitted.score}</p>
          </div>
        )}

        {quiz.questions.map((question, index) => (
          <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-600">C?u {index + 1}</p>
                <h2 className="mt-2 text-lg font-semibold leading-7 text-slate-900">{question.question_text}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {answers[String(question.id)] ? '?? ch?n' : 'Ch?a tr? l?i'}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {question.answers.map((answer) => {
                const checked = answers[String(question.id)] === String(answer.id)
                return (
                  <label
                    key={answer.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      checked
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={checked}
                      onChange={() => setAnswers((current) => ({ ...current, [String(question.id)]: String(answer.id) }))}
                    />
                    <span className="text-slate-800">{answer.answer_text}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&studentView=1`)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700"
          >
            M? map l?p 10
          </button>
          <button
            disabled={!isComplete}
            onClick={handleSubmit}
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            N?p quiz
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizTakerPage
