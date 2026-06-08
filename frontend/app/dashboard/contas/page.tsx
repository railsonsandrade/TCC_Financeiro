'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contasAPI, Conta } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, EyeOff, Palette } from 'lucide-react'

// Paleta de cores pré-definidas para seleção rápida
const COR_PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#84CC16', '#A855F7',
]

interface ColorPickerProps {
  value: string
  onChange: (cor: string) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mt-1 space-y-3">
      {/* Preview + input nativo */}
      <div
        className="flex items-center gap-3 h-11 w-full rounded-md px-3 cursor-pointer hover:border-yellow-500 transition-colors"
        style={{ border: '1px solid var(--border)', background: 'var(--muted)' }}
        onClick={() => inputRef.current?.click()}
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-white/20 shadow-md flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-mono flex-1" style={{ color: 'var(--foreground)' }}>{value.toUpperCase()}</span>
        <Palette className="w-4 h-4 text-gray-500" />
        {/* Input nativo invisível */}
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </div>

      {/* Paleta de cores rápidas */}
      <div className="grid grid-cols-6 gap-2">
        {COR_PALETTE.map((cor) => (
          <button
            key={cor}
            type="button"
            onClick={() => onChange(cor)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === cor ? 'border-white scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: cor }}
            title={cor}
          />
        ))}
      </div>
    </div>
  )
}

export default function ContasPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConta, setEditingConta] = useState<Conta | null>(null)
  const [saldoOculto, setSaldoOculto] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Conta Corrente' as 'Conta Corrente' | 'Poupança' | 'Carteira' | 'Outro',
    saldo_inicial: '',
    cor: '#3B82F6'
  })

  const toggleSaldo = (id: number) => {
    setSaldoOculto(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    loadContas()
  }, [])

  const loadContas = async () => {
    try {
      setLoading(true)
      const response = await contasAPI.listarComSaldo()
      setContas(response.data)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: Partial<Conta> = {
        ...formData,
        saldo_inicial: parseFloat(formData.saldo_inicial) || 0,
      }
      if (editingConta) {
        await contasAPI.atualizar(editingConta.id_conta, payload)
      } else {
        await contasAPI.criar(payload)
      }
      setShowModal(false)
      resetForm()
      loadContas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao salvar conta')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente desativar esta conta?')) return
    try {
      await contasAPI.desativar(id)
      loadContas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao desativar conta')
    }
  }

  const handleEdit = (conta: Conta) => {
    setEditingConta(conta)
    setFormData({
      nome: conta.nome,
      tipo: conta.tipo,
      saldo_inicial: String(conta.saldo_inicial),
      cor: conta.cor || '#3B82F6'
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingConta(null)
    setFormData({
      nome: '',
      tipo: 'Conta Corrente',
      saldo_inicial: '',
      cor: '#3B82F6'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Contas Financeiras</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Gerencie suas contas bancárias e carteiras</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md text-black bg-yellow-500 hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contas.map((conta) => (
          <div
            key={conta.id_conta}
            className="rounded-2xl transition-all hover:shadow-md flex flex-col overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Top bar color stripe */}
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${conta.cor || '#3b82f6'}, ${conta.cor || '#3b82f6'}44)` }}
            />
            
            {/* Header */}
            <div className="p-4 flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full shadow-md flex-shrink-0"
                  style={{ backgroundColor: conta.cor || '#3b82f6' }}
                />
                <span className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{conta.nome}</span>
              </div>
              {/* Botão olhinho */}
              <button
                type="button"
                onClick={() => toggleSaldo(conta.id_conta)}
                className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                title={saldoOculto.has(conta.id_conta) ? 'Mostrar saldo' : 'Ocultar saldo'}
              >
                {saldoOculto.has(conta.id_conta) ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-500" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Tipo</p>
                  <p className="font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{conta.tipo}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Saldo Atual</p>
                  <p className="text-2xl font-bold tracking-wider mt-0.5" style={{ color: 'var(--foreground)' }}>
                    {saldoOculto.has(conta.id_conta)
                      ? '• • • • • •'
                      : formatCurrency(parseFloat(String(conta.saldo_atual || conta.saldo_inicial)))}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => handleEdit(conta)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(conta.id_conta)}
                  className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contas.length === 0 && (
        <Card style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <CardContent className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>Nenhuma conta cadastrada</p>
            <Button
              className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              onClick={() => { resetForm(); setShowModal(true) }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira conta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal Nova / Editar Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8 overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }}>
            <CardHeader style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              <CardTitle style={{ color: 'var(--foreground)' }}>
                {editingConta ? 'Editar Conta' : 'Nova Conta'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Ex: Nubank, Itaú..."
                    className="mt-1"
                    style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Tipo</label>
                  <select
                    className="flex h-11 w-full rounded-md px-3 py-1 text-sm mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  >
                    <option value="Conta Corrente">Conta Corrente</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Carteira">Carteira</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Saldo Inicial</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.saldo_inicial}
                    onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                    required
                    placeholder="0,00"
                    className="mt-1"
                    style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Cor da Conta</label>
                  <ColorPicker
                    value={formData.cor}
                    onChange={(cor) => setFormData({ ...formData, cor })}
                  />
                </div>

                <div className="flex space-x-3 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all border"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all text-black bg-yellow-500 hover:bg-yellow-400"
                  >
                    {editingConta ? 'Salvar Alterações' : 'Criar Conta'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
