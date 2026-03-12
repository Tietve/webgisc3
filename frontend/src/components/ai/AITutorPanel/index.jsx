import { useEffect, useMemo, useState } from 'react'
import { Bot, Loader2, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { aiTutorService } from '@services'

const EMPTY_CONTEXT = {
  lesson_id: null,
  quiz_id: null,
  classroom_id: null,
  module_code: '',
  active_layers: [],
  question_context: [],
  lesson_step: null,
  grade_level: '',
  semester: '',
  textbook_series: '',
}

const QUICK_HINT_TITLE = '\u0047\u1ee3i \u00fd nhanh'
const QUICK_HINT_BODY = 'H\u00e3y h\u1ecfi v\u1ec1 l\u1edbp b\u1ea3n \u0111\u1ed3, thao t\u00e1c \u1edf b\u01b0\u1edbc hi\u1ec7n t\u1ea1i ho\u1eb7c l\u00fd do \u0111\u00e1p \u00e1n quiz \u0111\u00fang/sai.'

const AITutorPanel = ({ isOpen, onClose, context = {}, title = 'AI Tutor' }) => {
  const safeContext = useMemo(() => ({ ...EMPTY_CONTEXT, ...(context || {}) }), [context])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const contextKey = useMemo(
    () => JSON.stringify({
      lessonId: safeContext.lesson_id,
      quizId: safeContext.quiz_id,
      classroomId: safeContext.classroom_id,
      moduleCode: safeContext.module_code,
    }),
    [safeContext]
  )

  const quickPrompts = useMemo(() => {
    const prompts = []
    if (safeContext.lesson_id) prompts.push('Gi\u1ea3i th\u00edch b\u00e0i n\u00e0y')
    if (safeContext.active_layers?.length) prompts.push('Gi\u1ea3i th\u00edch b\u1ea3n \u0111\u1ed3 \u0111ang xem')
    if (typeof safeContext.lesson_step === 'number') prompts.push('H\u1ecfi v\u1ec1 b\u01b0\u1edbc n\u00e0y')
    if (safeContext.quiz_id && safeContext.question_context?.length) prompts.push('Gi\u00fap em hi\u1ec3u c\u00e2u sai')
    return prompts
  }, [safeContext])

  useEffect(() => {
    setMessages([])
    setConversationId(null)
    setInput('')
    setError(null)
  }, [contextKey])

  useEffect(() => {
    if (!isOpen || !conversationId) return

    const loadConversation = async () => {
      try {
        const data = await aiTutorService.getConversation(conversationId)
        setMessages(
          (data.messages || [])
            .filter((message) => message.role !== 'system')
            .map((message) => ({
              id: message.id,
              role: message.role,
              content: message.content,
            }))
        )
      } catch (err) {
        console.error('Failed to load AI conversation:', err)
      }
    }

    loadConversation()
  }, [conversationId, isOpen])

  if (!isOpen) return null

  const sendMessage = async (message) => {
    const trimmed = message.trim()
    if (!trimmed || !safeContext.grade_level || !safeContext.semester || !safeContext.textbook_series) return

    const optimistic = { id: `user-${Date.now()}`, role: 'user', content: trimmed }
    setMessages((prev) => [...prev, optimistic])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await aiTutorService.respond({
        conversation_id: conversationId,
        message: trimmed,
        ...safeContext,
      })
      setConversationId(response.conversation_id)
      setMessages((prev) => [
        ...prev,
        {
          id: response.message_id,
          role: 'assistant',
          content: response.assistant_message,
          followups: response.suggested_followups || [],
        },
      ])
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i AI Tutor')
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id))
    } finally {
      setLoading(false)
    }
  }

  const sendFeedback = async (messageId, rating) => {
    try {
      await aiTutorService.sendFeedback(messageId, { rating })
    } catch (err) {
      console.error('Feedback failed:', err)
    }
  }

  const contextSummary = safeContext.grade_level
    ? `L\u1edbp ${safeContext.grade_level} \u2022 HK${safeContext.semester} \u2022 C\u00e1nh Di\u1ec1u${safeContext.module_code ? ` \u2022 ${safeContext.module_code}` : ''}`
    : 'Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp WebGIS'

  return (
    <div className="fixed inset-y-0 right-0 z-[1100] flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            <p className="truncate text-xs text-blue-100">{contextSummary}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-white/10" aria-label={'\u0110\u00f3ng AI Tutor'}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-slate-50 px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">{QUICK_HINT_TITLE}</p>
            <p className="mt-1 text-blue-800">{QUICK_HINT_BODY}</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === 'assistant' ? 'border border-blue-100 bg-white text-gray-800' : 'ml-8 bg-blue-600 text-white'}`}>
            <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            {message.role === 'assistant' && (
              <div className="mt-3 flex items-center gap-2 text-gray-500">
                <button onClick={() => sendFeedback(message.id, 1)} className="rounded-full border border-gray-200 p-1.5 hover:bg-gray-50" aria-label={'H\u1eefu \u00edch'}>
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button onClick={() => sendFeedback(message.id, -1)} className="rounded-full border border-gray-200 p-1.5 hover:bg-gray-50" aria-label={'Ch\u01b0a h\u1eefu \u00edch'}>
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            )}
            {message.followups?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.followups.map((followup) => (
                  <button
                    key={followup}
                    onClick={() => sendMessage(followup)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    {followup}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            {'AI \u0111ang suy ngh\u0129...'}
          </div>
        )}

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={'V\u00ed d\u1ee5: Gi\u1ea3i th\u00edch v\u00ec sao l\u1edbp n\u00e0y quan tr\u1ecdng trong b\u00e0i h\u1ecdc'}
            rows={3}
            className="min-h-[88px] flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none ring-0 transition focus:border-blue-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            aria-label={'G\u1eedi tin nh\u1eafn'}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITutorPanel
