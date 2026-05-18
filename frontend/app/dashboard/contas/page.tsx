'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contasAPI, Conta } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

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
          <h1 className="text-3xl font-bold text-gray-50">Contas Financeiras</h1>
          <p className="text-gray-400 mt-1">Gerencie suas contas bancárias e carteiras</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contas.map((conta) => (
          <Card key={conta.id_conta} className="bg-[#12161f] border-[#222834] hover:shadow-lg transition-shadow hover:border-[#3e485e]">
            <CardHeader className="pb-3 border-b border-[#222834] bg-[#151a22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-md"
                    style={{ backgroundColor: conta.cor || '#3b82f6' }}
                  />
                  <CardTitle className="text-lg text-gray-100">{conta.nome}</CardTitle>
                </div>
                <button
                  onClick={() => toggleSaldo(conta.id_conta)}
                  className="p-1 rounded-lg hover:bg-[#1a202c] transition-colors"
                  title={saldoOculto.has(conta.id_conta) ? 'Mostrar saldo' : 'Ocultar saldo'}
                >
                  {saldoOculto.has(conta.id_conta) ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-emerald-500" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-gray-400">Tipo</p>
                <p className="font-medium text-gray-200">{conta.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Saldo Atual</p>
                <p className="text-2xl font-bold text-gray-50">
                  {saldoOculto.has(conta.id_conta)
                    ? '••••••'
                    : formatCurrency(parseFloat(String(conta.saldo_atual || conta.saldo_inicial)))}
                </p>
              </div>
              <div className="flex space-x-2 pt-4 border-t border-[#222834]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#3e485e] text-gray-300 hover:bg-[#1a202c]"
                  onClick={() => handleEdit(conta)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(conta.id_conta)}
                  className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contas.length === 0 && (
        <Card className="bg-[#12161f] border-[#222834]">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma conta cadastrada</p>
            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira conta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-[#12161f] border-[#222834] shadow-[0_0_40px_rgba(0,0,0,0.5)] my-8">
            <CardHeader className="border-b border-[#222834] bg-[#151a22]">
              <CardTitle className="text-gray-100">{editingConta ? 'Editar Conta' : 'Nova Conta'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="mt-1 border-[#2a3140] bg-[#1a202c] text-gray-200 focus-visible:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Tipo</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-[#2a3140] bg-[#1a202c] px-3 py-1 text-sm text-gray-200 mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
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
                  <label className="text-sm font-medium text-gray-300">Saldo Inicial</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.saldo_inicial}
                    onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                    required
                    className="mt-1 border-[#2a3140] bg-[#1a202c] text-gray-200 focus-visible:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Cor</label>
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="mt-1 border-[#2a3140] bg-[#1a202c] h-11 p-1 w-full"
                  />
                </div>
                <div className="flex space-x-3 pt-6 border-t border-[#222834]">
                  <Button type="button" variant="outline" className="flex-1 border-[#3e485e] hover:bg-[#1a202c] text-gray-300" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                    {editingConta ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
