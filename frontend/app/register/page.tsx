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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.register({ nome, email, senha })
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
          <h1 className="text-3xl font-bold text-gray-50 mb-2">Criar nova conta</h1>
          <p className="text-gray-400 text-sm">
            Junte-se ao painel financeiro do Sob Controle
          </p>
        </div>

        {/* Register Card */}
        <div className="w-full bg-[#12161f]/95 backdrop-blur-xl border border-[#222834] rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-100">Cadastro</h2>
            <p className="text-sm text-gray-500 mt-1">Preencha seus dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome Completo</label>
              <div className="relative">
                <Input
                  id="register-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl border border-[#2a3140] bg-[#1a202c] text-sm text-gray-200 placeholder-gray-500 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="Ex: José Ricardo"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
              <div className="relative">
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl border border-[#2a3140] bg-[#1a202c] text-sm text-gray-200 placeholder-gray-500 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="seu@sobcontrole.com"
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
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-[#2a3140] bg-[#1a202c] text-sm text-gray-200 placeholder-gray-500 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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

          <div className="mt-6 pt-6 border-t border-[#222834] flex justify-center">
             <Link href="/login" className="text-sm text-gray-400 flex items-center gap-2 hover:text-yellow-500 transition-colors">
               <ArrowLeft className="w-4 h-4" /> Voltar ao Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
