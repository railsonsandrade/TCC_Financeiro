'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import ConstellationBackground from '@/components/ConstellationBackground'
import { Eye, EyeOff, Target } from 'lucide-react'

const typeWriterPhrases = [
  "A Gestão do Seu Dinheiro na Palma da Mão",
  "Suas Finanças Pessoais de Forma Inteligente"
]

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Typewriter effect state
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = typeWriterPhrases[phraseIndex]
    let timeout: NodeJS.Timeout

    if (isDeleting) {
      if (charIndex > 0) {
        timeout = setTimeout(() => setCharIndex(c => c - 1), 30)
      } else {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % typeWriterPhrases.length)
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => setCharIndex(c => c + 1), 60)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 3000)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex])

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

  const inputStyle = {
    background: 'var(--input)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative bg-transparent overflow-hidden font-sans">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Constellation Background */}
      <ConstellationBackground />

      {/* Lado Esquerdo - SOB Controle Apresentação */}
      <div className="relative w-full lg:w-3/5 flex flex-col items-center justify-center p-8 lg:p-12 z-10 min-h-[50vh] lg:min-h-screen">
        <div className="max-w-2xl text-center flex flex-col items-center">
          
          {/* Logo SOB Controle (Imagem Recortada Circular) */}
          <div className="flex items-center justify-center mb-10 select-none animate-in fade-in zoom-in duration-700">
            <div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden group bg-[#f0e6d2] flex items-center justify-center"
              style={{
                border: '4px solid var(--card)',
                boxShadow: '0 0 50px rgba(234,179,8,0.3)',
              }}
            >
              <img 
                src="/novaLOGO.png" 
                alt="Logo SobControle Finanças" 
                className="w-full h-full object-cover scale-[1.05] transition-transform duration-500 group-hover:scale-[1.12]"
              />
            </div>
          </div>

          {/* Typewriter Text */}
          <div className="h-32 flex items-center justify-center w-full">
            <h2 className="text-yellow-500 text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight drop-shadow-md">
              {typeWriterPhrases[phraseIndex].substring(0, charIndex)}
              <span className="animate-[pulse_0.8s_ease-in-out_infinite] font-light" style={{ color: 'var(--foreground)' }}>|</span>
            </h2>
          </div>

          {/* Subtext */}
          <p className="max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed tracking-wide font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Plataforma inteligente que consolida suas contas, gerencia seus lançamentos e ajuda a alcançar suas metas financeiras!
          </p>

          {/* Stats Bar */}
          <div
            className="flex items-center justify-center gap-10 md:gap-16 mt-12 w-full pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold drop-shadow-md" style={{ color: 'var(--foreground)' }}>100%</p>
              <p className="text-yellow-500 text-[10px] md:text-xs uppercase tracking-widest mt-1.5 font-bold">Seguro</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold drop-shadow-md" style={{ color: 'var(--foreground)' }}>Zero</p>
              <p className="text-yellow-500 text-[10px] md:text-xs uppercase tracking-widest mt-1.5 font-bold">Taxas Ocultas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold drop-shadow-md" style={{ color: 'var(--foreground)' }}>24/7</p>
              <p className="text-yellow-500 text-[10px] md:text-xs uppercase tracking-widest mt-1.5 font-bold">Controle</p>
            </div>
          </div>

        </div>
      </div>

      {/* Lado Direito - Login Card */}
      <div className="relative w-full lg:w-2/5 flex flex-col items-center justify-center p-6 lg:p-12 z-20 min-h-[50vh] lg:min-h-screen">
        
        <div
          className="w-full max-w-[420px] backdrop-blur-xl rounded-[20px] p-8 md:p-10 animate-in fade-in slide-in-from-right-8 duration-700"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 40px rgba(0,0,0,0.15)',
          }}
        >
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 tracking-wide" style={{ color: 'var(--card-foreground)' }}>Bem-vindo de volta</h2>
            <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>Acesse o painel financeiro</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all shadow-inner"
                style={inputStyle}
                placeholder="demo@sobcontrole.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>Senha</label>
                <a href="#" className="text-[11px] text-yellow-500 hover:text-yellow-400 transition-colors font-medium">Esqueci minha senha</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-11 pl-4 pr-11 rounded-xl text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all shadow-inner"
                  style={inputStyle}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 flex items-center justify-center rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Não tem uma conta?{' '}
              <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">
                Criar conta
              </Link>
            </p>
          </div>

        </div>
        
        <p className="text-[11px] mt-8 tracking-wide" style={{ color: 'var(--muted-foreground)' }}>© 2026 Sob Controle — Todos os direitos reservados.</p>
      
      </div>

    </div>
  )
}
