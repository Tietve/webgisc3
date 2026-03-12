import { useEffect, useMemo, useState } from 'react'
import { Bot, Loader2, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { aiTutorService } from '@services'

const AITutorPanel = ({ isOpen, onClose, context, title = 'AI Tutor' }) => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const contextKey = useMemo(
    () => JSON.stringify({
      lessonId: context.lesson_id,
      quizId: context.quiz_id,
      classroomId: context.classroom_id,
      moduleCode: context.module_code,
    }),
    [context]
  )

  const quickPrompts = useMemo(() => {
    const prompts = []
    if (context.lesson_id) prompts.push('Gi?i th?ch b?i n?y')
    if (context.active_layers?.length) prompts.push('Gi?i th?ch b?n ?? ?ang xem')
    if (typeof context.lesson_step === 'number') prompts.push('H?i v? b??c n?y')
    if (context.quiz_id && context.question_context?.length) prompts.push('Gi?p em hi?u c?u sai')
    return prompts
  }, [context])

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
    if (!trimmed || !context.grade_level || !context.semester || !context.textbook_series) return

    const optimistic = { id: `user-${Date.now()}`, role: 'user', content: trimmed }
    setMessages((prev) => [...prev, optimistic])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await aiTutorService.respond({
        conversation_id: conversationId,
        message: trimmed,
        ...context,
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
      setError(err.response?.data?.detail || err.message || 'Kh?ng th? k?t n?i AI Tutor')
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

  return (
    <div className="fixed inset-y-0 right-0 z-[1100] w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{title}</p>
            <p className="text-xs text-blue-100 truncate">
              L?p {context.grade_level} ? HK{context.semester} ? C?nh Di?u{context.module_code ? ` ? ${context.module_code}` : ''}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="??ng AI Tutor">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2 bg-gray-50">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
            H?i v? b?i h?c hi?n t?i, b?n ?? ?ang xem, ho?c nh? AI gi?i th?ch l?i theo c?ch d? hi?u h?n.
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              <p>{message.content}</p>
              {message.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {message.followups?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.followups.map((followup) => (
                        <button key={followup} onClick={() => sendMessage(followup)} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                          {followup}
                        </button>
                      ))}
                    </div>
                  )}
                  {typeof message.id === 'number' && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <button onClick={() => sendFeedback(message.id, 1)} className="hover:text-green-600" aria-label="H?u ?ch">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => sendFeedback(message.id, -1)} className="hover:text-red-600" aria-label="Ch?a h?u ?ch">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI ?ang suy ngh?...
            </div>
          </div>
        )}

        {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage(input)
        }}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="H?i AI v? b?i h?c, b?n ??, ho?c ph?n em ch?a hi?u..."
            className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 w-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AITutorPanel
