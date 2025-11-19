'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast, ToastType } from '@/components/ui/toast'
import Link from 'next/link'
import { Wallet, User, Mail, Lock, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen flex">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Comece a organizar suas finanças hoje mesmo
          </h2>
          <p className="text-blue-100 text-lg">
            Crie sua conta gratuitamente e tenha acesso a todas as funcionalidades.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold">Fácil</p>
              <p className="text-blue-100 text-sm">De usar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold">Seguro</p>
              <p className="text-blue-100 text-sm">100%</p>
            </div>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2025 TCC Financeira. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
              <p className="text-gray-600">Preencha os dados abaixo para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-10"
                    placeholder="João Silva"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold group"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Criar conta
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
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
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

