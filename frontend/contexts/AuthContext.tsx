'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, Usuario, LoginRequest, RegisterRequest } from '@/lib/api'

interface AuthContextType {
  user: Usuario | null
  loading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser))
        // Validar token com o backend
        authAPI.me()
          .then(response => {
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          })
          .catch(() => {
            // Token inválido
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch (error) {
        // Erro ao fazer parse do JSON
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data: LoginRequest) => {
    try {
      const response = await authAPI.login(data)
      const { access_token, usuario } = response.data

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(usuario))
      setUser(usuario)

      // Redirecionar usando window.location para garantir navegação
      window.location.href = '/dashboard'
    } catch (error) {
      // Propagar o erro para ser tratado no componente
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      await authAPI.register(data)
      // Após registro, fazer login automaticamente
      await login({ email: data.email, senha: data.senha })
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao criar conta')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

