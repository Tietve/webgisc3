import { useState, useCallback } from 'react'

/**
 * Custom hook for API calls with loading and error states
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunc(...args)
        setData(result)
        return { success: true, data: result }
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Đã xảy ra lỗi'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [apiFunc]
  )

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { data, loading, error, execute, reset }
}
