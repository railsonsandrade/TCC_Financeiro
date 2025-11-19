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
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Conta Corrente' as 'Conta Corrente' | 'Poupança' | 'Carteira' | 'Outro',
    saldo_inicial: '',
    cor: '#3B82F6'
  })

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
      if (editingConta) {
        await contasAPI.atualizar(editingConta.id_conta, formData)
      } else {
        await contasAPI.criar(formData)
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
      saldo_inicial: conta.saldo_inicial,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas Financeiras</h1>
          <p className="text-gray-600 mt-1">Gerencie suas contas bancárias e carteiras</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contas.map((conta) => (
          <Card key={conta.id_conta} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: conta.cor || '#3B82F6' }}
                  />
                  <CardTitle className="text-lg">{conta.nome}</CardTitle>
                </div>
                {conta.ativa ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium">{conta.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(parseFloat(conta.saldo_atual || conta.saldo_inicial))}
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(conta)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(conta.id_conta)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Nenhuma conta cadastrada</p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira conta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingConta ? 'Editar Conta' : 'Nova Conta'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
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
                  <label className="text-sm font-medium">Saldo Inicial</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.saldo_inicial}
                    onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cor</label>
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
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

