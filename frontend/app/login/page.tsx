'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import AnimatedWaves from '@/components/AnimatedWaves'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const TAGLINES = [
  'Controle Total das suas Finanças',
  'Metas Inteligentes, Resultados Reais',
  'Menos Preocupação, Mais Economia',
  'Seu Dinheiro Sob Controle',
  'Planeje, Economize, Conquiste',
]

function useTypewriter(phrases: string[], typeSpeed = 80, deleteSpeed = 40, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setDisplayText(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseTime])

  return displayText
}

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const typedText = useTypewriter(TAGLINES)

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
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <Image
              src="/novaLOGO.png"
              alt="Sob Controle Logo"
              width={180}
              height={180}
              className="drop-shadow-2xl"
              priority
            />
          </div>

          {/* Typewriter Text */}
          <div className="min-h-[100px]">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
            }}>
              {typedText}
              <span className="inline-block w-0.5 h-8 md:h-10 bg-sky-400 ml-1 animate-pulse align-middle" />
            </h2>
          </div>

          {/* Description */}
          <p className="text-sky-200/70 text-base md:text-lg leading-relaxed max-w-md">
            Gestão financeira inteligente que organiza, controla e transforma suas finanças pessoais.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-10 md:gap-14 pt-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">100%</p>
              <p className="text-sky-300/60 text-xs md:text-sm font-medium tracking-wider uppercase mt-1">Gratuito</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">24/7</p>
              <p className="text-sky-300/60 text-xs md:text-sm font-medium tracking-wider uppercase mt-1">Disponível</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">99.9%</p>
              <p className="text-sky-300/60 text-xs md:text-sm font-medium tracking-wider uppercase mt-1">Uptime</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full max-w-sm lg:max-w-md">
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
              <h3 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h3>
              <p className="text-gray-500 mt-2 text-sm">Entre com suas credenciais</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="jose.ricardo@brobot.com.br"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  <button type="button" className="text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors">
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    placeholder="••••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                >
                  Criar conta gratuita
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
