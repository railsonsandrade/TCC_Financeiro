'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { lancamentosAPI, contasAPI, categoriasAPI, Lancamento, Conta, Categoria } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Check, X, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null)
  const [formData, setFormData] = useState({
    id_conta: '',
    id_categoria: '',
    tipo: 'Despesa' as 'Receita' | 'Despesa',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    descricao: '',
    pago: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [lancamentosRes, contasRes, categoriasRes] = await Promise.all([
        lancamentosAPI.listarComDetalhes(),
        contasAPI.listar(),
        categoriasAPI.listar()
      ])
      setLancamentos(lancamentosRes.data)
      setContas(contasRes.data)
      setCategorias(categoriasRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        id_conta: parseInt(formData.id_conta),
        id_categoria: parseInt(formData.id_categoria),
        origem: 'Manual' as const
      }
      
      if (editingLancamento) {
        await lancamentosAPI.atualizar(editingLancamento.id_lancamento, data)
      } else {
        await lancamentosAPI.criar(data)
      }
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao salvar lançamento')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este lançamento?')) return
    try {
      await lancamentosAPI.deletar(id)
      loadData()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao excluir lançamento')
    }
  }

  const handleTogglePago = async (lancamento: Lancamento) => {
    try {
      if (!lancamento.pago) {
        await lancamentosAPI.marcarPago(lancamento.id_lancamento)
      } else {
        await lancamentosAPI.atualizar(lancamento.id_lancamento, { pago: false })
      }
      loadData()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao atualizar lançamento')
    }
  }

  const handleEdit = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento)
    setFormData({
      id_conta: lancamento.id_conta.toString(),
      id_categoria: lancamento.id_categoria.toString(),
      tipo: lancamento.tipo,
      valor: lancamento.valor,
      data: lancamento.data,
      descricao: lancamento.descricao,
      pago: lancamento.pago
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingLancamento(null)
    setFormData({
      id_conta: '',
      id_categoria: '',
      tipo: 'Despesa',
      valor: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      descricao: '',
      pago: true
    })
  }

  const categoriasFiltradas = categorias.filter(c => c.tipo === formData.tipo)

  const totais = lancamentos.reduce((acc, lanc) => {
    const valor = parseFloat(lanc.valor)
    if (lanc.tipo === 'Receita') {
      acc.receitas += valor
    } else {
      acc.despesas += valor
    }
    return acc
  }, { receitas: 0, despesas: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Lançamentos</h1>
          <p className="text-gray-600 mt-1">Registre suas receitas e despesas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.receitas)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totais.despesas)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${totais.receitas - totais.despesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totais.receitas - totais.despesas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum lançamento registrado</p>
              <Button className="mt-4" onClick={() => { resetForm(); setShowModal(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro lançamento
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lancamentos.map((lancamento) => (
                <div 
                  key={lancamento.id_lancamento}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${lancamento.tipo === 'Receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {lancamento.tipo === 'Receita' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{lancamento.descricao}</p>
                      <p className="text-sm text-gray-600">
                        {lancamento.nome_categoria} • {lancamento.nome_conta} • {formatDate(lancamento.data)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${lancamento.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {lancamento.tipo === 'Receita' ? '+' : '-'} {formatCurrency(parseFloat(lancamento.valor))}
                      </p>
                      <p className="text-xs text-gray-600">
                        {lancamento.pago ? (
                          <span className="text-green-600 flex items-center justify-end">
                            <Check className="w-3 h-3 mr-1" />
                            Pago
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center justify-end">
                            <X className="w-3 h-3 mr-1" />
                            Pendente
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePago(lancamento)}
                    >
                      {lancamento.pago ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(lancamento)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lancamento.id_lancamento)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>{editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any, id_categoria: '' })}
                  >
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Conta</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={formData.id_conta}
                    onChange={(e) => setFormData({ ...formData, id_conta: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {contas.map(conta => (
                      <option key={conta.id_conta} value={conta.id_conta}>{conta.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={formData.id_categoria}
                    onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {categoriasFiltradas.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pago"
                    checked={formData.pago}
                    onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="pago" className="text-sm font-medium">Pago</label>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingLancamento ? 'Salvar' : 'Criar'}
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

