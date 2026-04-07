'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import ConstellationBackground from '@/components/ConstellationBackground'
import { Mail, Lock, Eye, EyeOff, Bot } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({ email, senha })
      setToast({ message: 'Login realizado com sucesso!', type: 'success' })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Email ou senha incorretos'
      setToast({ message: errorMessage, type: 'error' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f16] flex flex-col items-center justify-center p-4">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Constellation Canvas Background */}
      <ConstellationBackground />

      {/* Centered Content Layout */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in duration-700">
        
        {/* Logo and Greeting Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#151a22] rounded-2xl flex items-center justify-center mb-6 border border-[#222834] shadow-[0_0_15px_rgba(234,179,8,0.15)]">
            <Bot className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-50 mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-400 text-sm">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#12161f]/95 backdrop-blur-xl border border-[#222834] rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-100">Login</h2>
            <p className="text-sm text-gray-500 mt-1">Acesse o painel financeiro do Sob Controle</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl border border-[#2a3140] bg-[#1a202c] text-sm text-gray-200 placeholder-gray-500 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="demo@sobcontrole.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Senha</label>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-[#2a3140] bg-[#1a202c] text-sm text-gray-200 placeholder-gray-500 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 rounded-xl text-sm font-bold text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-400"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black mr-2" />
                  Entrando...
                </div>
              ) : (
                '➜ Entrar'
              )}
            </button>
          </form>

          {/* Demo helper */}
          <div className="mt-6 pt-6 border-t border-[#222834] text-center">
             <p className="text-xs text-gray-500">
               Demo: <span className="text-yellow-500/80">demo@nextwallet.com</span> / <span className="text-yellow-500/80">demo123</span>
             </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
