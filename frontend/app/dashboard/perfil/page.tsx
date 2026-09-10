'use client'

import { useState, useEffect } from 'react'
import { authAPI, Usuario } from '@/lib/api'
import { Toast, ToastType } from '@/components/ui/toast'
import { User, Save, Shield, CreditCard, Mail } from 'lucide-react'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [rendaMensal, setRendaMensal] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await authAPI.me()
      setNome(res.data.nome || '')
      setEmail(res.data.email || '')
      setRendaMensal(res.data.renda_mensal ? res.data.renda_mensal.toString() : '')
    } catch (error) {
      console.error('Erro ao carregar perfil', error)
      setToast({ message: 'Erro ao carregar dados do perfil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (novaSenha && novaSenha !== confirmarSenha) {
      setToast({ message: 'As senhas não coincidem', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const updateData: any = {
        nome,
        email,
      }
      
      const rendaNum = parseFloat(rendaMensal)
      if (!isNaN(rendaNum)) {
        updateData.renda_mensal = rendaNum
      }

      if (novaSenha) {
        updateData.senha = novaSenha
      }

      await authAPI.updateMe(updateData)
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' })
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao atualizar perfil'
      setToast({ message: msg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'var(--input)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <User className="w-6 h-6 text-yellow-500" />
          Meu Perfil
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Gerencie suas informações cadastrais e preferências da conta
        </p>
      </div>

      <div 
        className="rounded-2xl p-8 shadow-sm mb-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-4" style={{ color: 'var(--card-foreground)' }}>
                <User className="w-5 h-5 text-yellow-500" />
                Dados Pessoais
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none focus:ring-yellow-500/50 focus:border-yellow-500"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all outline-none focus:ring-yellow-500/50 focus:border-yellow-500"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Renda Mensal (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rendaMensal}
                    onChange={(e) => setRendaMensal(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all outline-none focus:ring-yellow-500/50 focus:border-yellow-500"
                    style={inputStyle}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-4" style={{ color: 'var(--card-foreground)' }}>
                <Shield className="w-5 h-5 text-yellow-500" />
                Segurança
              </h3>
              
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Preencha os campos abaixo apenas se desejar alterar sua senha atual.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none focus:ring-yellow-500/50 focus:border-yellow-500"
                  style={inputStyle}
                  placeholder="Deixe em branco para não alterar"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 rounded-xl text-sm transition-all outline-none focus:ring-yellow-500/50 focus:border-yellow-500"
                  style={inputStyle}
                  placeholder="Confirme a nova senha"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: '#eab308', color: '#1a1a1a' }}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
