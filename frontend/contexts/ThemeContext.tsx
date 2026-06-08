'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Padrão: tema branco (light)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Recuperar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
    }
    // Se não houver tema salvo, mantém o padrão 'light'
  }, [])

  useEffect(() => {
    // Aplicar atributo no <html> para as variáveis CSS funcionarem
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
