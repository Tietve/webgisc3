import React, { createContext, useContext, useEffect, useState } from 'react'

/**
 * DarkModeContext - Manages dark mode state across the application
 *
 * Features:
 * - Persists dark mode preference to localStorage
 * - Applies/removes 'dark' class to document element
 * - Respects system preference on first load
 */
const DarkModeContext = createContext({
  isDark: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
})

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      return stored === 'true'
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply/remove dark class on document element
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Save to localStorage
    localStorage.setItem('darkMode', isDark.toString())
  }, [isDark])

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev)
  }

  const setDarkMode = (value) => {
    setIsDark(value)
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}
