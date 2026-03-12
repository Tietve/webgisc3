import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, Loader2, Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react'
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

const SECTION_EMOJIS = ['📘', '🧠', '🗺️', '💡', '❓']

const SECTION_STYLES = {
  '📘': {
    card: 'border-blue-200 bg-blue-50/90',
    title: 'text-blue-900',
  },
  '🧠': {
    card: 'border-violet-200 bg-violet-50/90',
    title: 'text-violet-900',
  },
  '🗺️': {
    card: 'border-emerald-200 bg-emerald-50/90',
    title: 'text-emerald-900',
  },
  '💡': {
    card: 'border-amber-200 bg-amber-50/90',
    title: 'text-amber-900',
  },
  '❓': {
    card: 'border-indigo-200 bg-indigo-50/90',
    title: 'text-indigo-900',
  },
  default: {
    card: 'border-slate-100 bg-slate-50/80',
    title: 'text-slate-900',
  },
}

const splitAssistantSections = (content) => {
  const lines = (content || '').split('\n')
  const sections = []
  let current = null

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) {
      if (current) current.body.push('')
      return
    }

    const icon = SECTION_EMOJIS.find((emoji) => line.startsWith(emoji))
    if (icon) {
      if (current) sections.push(current)
      current = { title: line, body: [] }
      return
    }

    if (!current) {
      current = { title: '', body: [] }
    }
    current.body.push(rawLine)
  })

  if (current) sections.push(current)
  return sections.length ? sections : [{ title: '', body: [content] }]
}

const AssistantMessage = ({ content }) => {
  const sections = useMemo(() => splitAssistantSections(content), [content])

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const icon = SECTION_EMOJIS.find((emoji) => section.title?.startsWith(emoji))
        const style = SECTION_STYLES[icon] || SECTION_STYLES.default

        return (
        <div key={`${section.title}-${index}`} className={`rounded-2xl border p-3 shadow-sm ${style.card}`}>
          {section.title ? <div className={`mb-2 text-sm font-semibold ${style.title}`}>{section.title}</div> : null}
          <div className="prose prose-sm max-w-none text-sm leading-6 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-slate-900 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5">
            <ReactMarkdown>{section.body.join('\n').trim()}</ReactMarkdown>
          </div>
        </div>
      )})}
    </div>
  )
}

const AITutorPanel = ({ isOpen, onClose, context = {}, title = 'AI Tutor', onAssistantResponse }) => {
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
      gradeLevel: safeContext.grade_level,
      semester: safeContext.semester,
      textbookSeries: safeContext.textbook_series,
    }),
    [safeContext]
  )

  const quickPrompts = useMemo(() => {
    const prompts = []
    if (safeContext.lesson_id) prompts.push('Giải thích bài này')
    if (safeContext.active_layers?.length) prompts.push('Giải thích bản đồ đang xem')
    if (typeof safeContext.lesson_step === 'number') prompts.push('Hỏi về bước này')
    if (safeContext.quiz_id && safeContext.question_context?.length) prompts.push('Giúp em hiểu câu sai')
    if (!safeContext.lesson_id && safeContext.module_code) prompts.push('Tóm tắt module này')
    if (!safeContext.lesson_id && !safeContext.module_code && safeContext.grade_level && safeContext.semester && safeContext.textbook_series) {
      prompts.push('Ôn tập học kì 1')
    }
    return prompts
  }, [safeContext])

  const placeholder = useMemo(() => {
    if (safeContext.lesson_id) return 'Ví dụ: Tóm gọn bài này giúp em thật dễ nhớ'
    if (safeContext.module_code) return 'Ví dụ: Module này có những ý chính nào?'
    if (safeContext.active_layers?.length) return 'Ví dụ: Bản đồ này đang thể hiện điều gì?'
    return 'Ví dụ: Giúp em ôn tập học kì 1 thật ngắn gọn'
  }, [safeContext])

  const quickHintBody = useMemo(() => {
    if (safeContext.lesson_id) return 'AI có thể trả lời theo kiểu tóm gọn, dễ hiểu hơn, có mẹo nhớ nhanh và câu hỏi tự kiểm tra.'
    if (safeContext.module_code) return 'AI có thể tóm tắt module, gom ý chính, và gợi ý cách học nhanh hơn.'
    return 'AI có thể giải thích bản đồ, tóm gọn kiến thức, hoặc giúp em ôn tập học kì 1.'
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
            .map((message) => ({ id: message.id, role: message.role, content: message.content }))
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
      onAssistantResponse?.(response)
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
      setError(err.response?.data?.detail || err.message || 'Không thể kết nối AI Tutor')
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
    ? `Lớp ${safeContext.grade_level} • HK${safeContext.semester} • Cánh Diều${safeContext.module_code ? ` • ${safeContext.module_code}` : ''}`
    : 'Trợ lý học tập WebGIS'

  const smartActions = ['Tóm ngắn hơn', 'Giải thích dễ hiểu hơn', 'Hỏi em 1 câu kiểm tra']

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
        <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-white/10" aria-label={'Đóng AI Tutor'}>
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
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Gợi ý nhanh</span>
            </div>
            <p className="mt-1 text-blue-800">{quickHintBody}</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === 'assistant' ? 'border border-blue-100 bg-white text-gray-800' : 'ml-8 bg-blue-600 text-white'}`}>
            {message.role === 'assistant' ? <AssistantMessage content={message.content} /> : <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>}

            {message.role === 'assistant' ? (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {smartActions.map((action) => (
                    <button
                      key={`${message.id}-${action}`}
                      onClick={() => sendMessage(`${action}: ${message.content.slice(0, 120)}`)}
                      className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                    >
                      {action}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 text-gray-500">
                  <button onClick={() => sendFeedback(message.id, 1)} className="rounded-full border border-gray-200 p-1.5 hover:bg-gray-50" aria-label={'Hữu ích'}>
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => sendFeedback(message.id, -1)} className="rounded-full border border-gray-200 p-1.5 hover:bg-gray-50" aria-label={'Chưa hữu ích'}>
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : null}

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
            {'AI đang suy nghĩ...'}
          </div>
        )}

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="min-h-[88px] flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none ring-0 transition focus:border-blue-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            aria-label={'Gửi tin nhắn'}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITutorPanel
