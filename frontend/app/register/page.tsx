'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import ConstellationBackground from '@/components/ConstellationBackground'
import { User, Mail, Lock, Eye, EyeOff, Bot, ArrowLeft } from 'lucide-react'
import { authAPI } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [renda, setRenda] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const renda_mensal = parseFloat(renda) || 0
      await authAPI.register({ nome, email, senha, renda_mensal })
      setToast({ message: 'Conta criada com sucesso! Redirecionando...', type: 'success' })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao criar conta'
      setToast({ message: errorMessage, type: 'error' })
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--input)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  }

  const inputFocusClass = 'focus:ring-yellow-500/50 focus:border-yellow-500'

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent flex flex-col items-center justify-center p-4">
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
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              boxShadow: '0 0 15px rgba(234,179,8,0.15)',
            }}
          >
            <Bot className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Criar nova conta</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Junte-se ao painel financeiro do Sob Controle
          </p>
        </div>

        {/* Register Card */}
        <div
          className="w-full backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold" style={{ color: 'var(--card-foreground)' }}>Cadastro</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Preencha seus dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Nome Completo</label>
              <div className="relative">
                <input
                  id="register-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none ${inputFocusClass}`}
                  style={{ ...inputStyle, '--tw-ring-color': 'rgba(234,179,8,0.5)' } as React.CSSProperties}
                  placeholder="Ex: José Ricardo"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>E-mail</label>
              <div className="relative">
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none ${inputFocusClass}`}
                  style={inputStyle}
                  placeholder="seu@sobcontrole.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Renda Mensal (R$)</label>
              <div className="relative">
                <input
                  id="register-renda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={renda}
                  onChange={(e) => setRenda(e.target.value)}
                  className={`w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none ${inputFocusClass}`}
                  style={inputStyle}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Senha</label>
              </div>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`w-full h-11 pl-4 pr-11 rounded-xl text-sm transition-all outline-none ${inputFocusClass}`}
                  style={inputStyle}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 rounded-xl text-sm font-bold text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-400"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black mr-2" />
                  Criando...
                </div>
              ) : (
                '➜ Criar Conta'
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-6 flex justify-center"
            style={{ borderTop: '1px solid var(--border)' }}
          >
             <Link href="/login" className="text-sm flex items-center gap-2 hover:text-yellow-500 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
               <ArrowLeft className="w-4 h-4" /> Voltar ao Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
