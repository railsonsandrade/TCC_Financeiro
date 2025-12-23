'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Lado Esquerdo - Branding com gradiente moderno */}
      <div className="hidden lg:flex lg:w-1/2 gradient-success p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
              <Image
                src="/novaLOGO.png"
                alt="Sob Controle Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Sob Controle</h1>
              <p className="text-green-100 text-sm">Seu dinheiro sob controle</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 relative z-10 animate-slide-up">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Comece a organizar suas finanças hoje
            </h2>
            <p className="text-green-100 text-xl leading-relaxed">
              Crie sua conta gratuitamente e tenha acesso completo a todas as funcionalidades.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-green-200" />
              <p className="text-lg">Controle total de receitas e despesas</p>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-green-200" />
              <p className="text-lg">Metas financeiras personalizadas</p>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-green-200" />
              <p className="text-lg">Relatórios e análises detalhadas</p>
            </div>
          </div>
        </div>

        <div className="text-green-100 text-sm relative z-10">
          © 2025 Sob Controle. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário moderno */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <Image
              src="/novaLOGO.png"
              alt="Sob Controle Logo"
              width={48}
              height={48}
              className="rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Sob Controle</h1>
              <p className="text-sm text-gray-600">Seu dinheiro sob controle</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta gratuita 🚀</h2>
              <p className="text-gray-600">Preencha os dados abaixo para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    placeholder="João Silva"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-13 text-base font-semibold gradient-success hover:opacity-90 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl group mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Criar minha conta gratuita
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  )
}

