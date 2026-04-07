'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import AnimatedWaves from '@/components/AnimatedWaves'
import { User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Target } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (senha !== confirmarSenha) {
      setToast({ message: 'As senhas não coincidem', type: 'error' })
      return
    }

    if (senha.length < 6) {
      setToast({ message: 'A senha deve ter pelo menos 6 caracteres', type: 'error' })
      return
    }

    setLoading(true)

    try {
      await register({ nome, email, senha })
      setToast({ message: 'Conta criada com sucesso!', type: 'success' })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao criar conta'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 40%, #134b7a 70%, #1a6fb5 100%)' }}>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Animated SVG Waves Background */}
      <AnimatedWaves />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-12 lg:gap-24">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-start text-left max-w-lg space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-start space-y-4">
            <Image
              src="/novaLOGO.png"
              alt="Sob Controle Logo"
              width={160}
              height={160}
              className="drop-shadow-2xl"
              priority
            />
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Comece a Organizar suas Finanças Hoje
            </h2>
          </div>

          {/* Description */}
          <p className="text-sky-200/70 text-lg leading-relaxed max-w-md">
            Crie sua conta gratuita e tenha controle total sobre receitas, despesas e metas financeiras.
          </p>

          {/* Benefits */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-400/10 border border-sky-400/20">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-sky-100/80 text-base">Controle total de receitas e despesas</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-400/10 border border-sky-400/20">
                <Target className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-sky-100/80 text-base">Metas financeiras personalizadas</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-400/10 border border-sky-400/20">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-sky-100/80 text-base">IA Copilot para orientação financeira</p>
            </div>
          </div>
        </div>

        {/* Right Side - Register Card */}
        <div className="w-full max-w-sm lg:max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <Image
              src="/novaLOGO.png"
              alt="Sob Controle Logo"
              width={48}
              height={48}
              className="drop-shadow-xl"
            />
          </div>

          <div
            className="rounded-2xl p-8 md:p-10 border"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 40px rgba(56,189,248,0.08)',
            }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                Criar conta gratuita
                <Sparkles className="w-5 h-5 text-sky-500" />
              </h3>
              <p className="text-gray-500 mt-2 text-sm">Preencha os dados abaixo para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="João Silva"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="register-password"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8, #06b6d4)',
                  boxShadow: '0 4px 15px rgba(14,165,233,0.4)',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(14,165,233,0.6)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.boxShadow = '0 4px 15px rgba(14,165,233,0.4)' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Criar minha conta gratuita
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sky-300/40 text-xs">
          © 2026 Sob Controle — Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
