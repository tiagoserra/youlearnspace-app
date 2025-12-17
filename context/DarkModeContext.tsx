'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DarkModeContextType } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user?.theme) {
  
      if (user.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
      } else {
        setIsDarkMode(user.theme === 'dark')
      }
    } else {
  
      const saved = localStorage.getItem('youlearnspace-dark-mode')

      if (saved !== null) {
        setIsDarkMode(saved === 'true')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
      }
    }

    setIsLoading(false)
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)

    if (isAuthenticated) {

      try {
        await fetch('/api/auth/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ theme: newMode ? 'dark' : 'light' })
        })
      } catch (error) {
        console.error('Erro ao salvar tema:', error)
      }
    } else {
      localStorage.setItem('youlearnspace-dark-mode', String(newMode))
    }
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isLoading }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (!context) throw new Error('useDarkMode must be used within DarkModeProvider')
  return context
}
