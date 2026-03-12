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

  const isComplete = useMemo(() => {
    if (!quiz?.questions) return false
    return quiz.questions.every((question) => answers[String(question.id)])
  }, [answers, quiz])

  const handleSubmit = async () => {
    const result = await quizService.submit(Number(id), answers)
    setSubmitted(result)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Đang tải quiz...</div>
  if (!quiz) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Không tìm thấy quiz.</div>

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl">
          <button onClick={() => navigate(ROUTES.GRADE_10)} className="mb-4 text-sm text-slate-300 hover:text-white">← Quay lại hub lớp 10</button>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{quiz.module_code}</p>
          <h1 className="mt-2 text-3xl font-black">{quiz.title}</h1>
          <p className="mt-2 text-slate-300">{quiz.description}</p>
        </div>

        {submitted && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-200">Nộp bài thành công</p>
            <p className="mt-1 text-2xl font-bold text-white">Điểm: {submitted.score}</p>
          </div>
        )}

        {quiz.questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl bg-slate-900 p-5 shadow-lg">
            <p className="text-sm text-cyan-300">Câu {index + 1}</p>
            <h2 className="mt-2 text-lg font-semibold">{question.question_text}</h2>
            <div className="mt-4 space-y-2">
              {question.answers.map((answer) => (
                <label key={answer.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 hover:border-cyan-400">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[String(question.id)] === String(answer.id)}
                    onChange={() => setAnswers((current) => ({ ...current, [String(question.id)]: String(answer.id) }))}
                  />
                  <span>{answer.answer_text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <button onClick={() => navigate(`${ROUTES.MAP}?grade=10&semester=1&textbook=canh-dieu&studentView=1`)} className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300">Mở map lớp 10</button>
          <button disabled={!isComplete} onClick={handleSubmit} className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Nộp quiz</button>
        </div>
      </div>
    </div>
  )
}

export default QuizTakerPage

