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
      // Converte strings do formulário para os tipos numéricos esperados pela API
      const data: Partial<Lancamento> = {
        ...formData,
        id_conta: parseInt(formData.id_conta),
        id_categoria: parseInt(formData.id_categoria),
        valor: parseFloat(formData.valor) || 0,
        origem: 'Manual',
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
      valor: String(lancamento.valor),
      data: lancamento.data,
      descricao: lancamento.descricao || '',  // fallback: descricao pode ser null/undefined
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
    const valor = parseFloat(String(lanc.valor))
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Lançamentos</h1>
          <p className="text-gray-400 mt-1">Registre suas receitas e despesas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#12161f] border-[#222834]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Receitas</p>
                <p className="text-2xl font-bold text-[#10b981]">{formatCurrency(totais.receitas)}</p>
              </div>
              <div className="p-2 bg-[#10b981]/10 rounded-lg border border-[#10b981]/20">
                <TrendingUp className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#12161f] border-[#222834]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Despesas</p>
                <p className="text-2xl font-bold text-[#ef4444]">{formatCurrency(totais.despesas)}</p>
              </div>
              <div className="p-2 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20">
                <TrendingDown className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#12161f] border-[#222834]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Saldo</p>
                <p className={`text-2xl font-bold ${totais.receitas - totais.despesas >= 0 ? 'text-[#eab308]' : 'text-[#f97316]'}`}>
                  {formatCurrency(totais.receitas - totais.despesas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lançamentos */}
      <Card className="bg-[#12161f] border-[#222834]">
        <CardHeader className="border-b border-[#222834] bg-[#151a22]">
          <CardTitle className="text-gray-100">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {lancamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum lançamento registrado</p>
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-6" onClick={() => { resetForm(); setShowModal(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro lançamento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lancamentos.map((lancamento) => (
                <div 
                  key={lancamento.id_lancamento}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1a202c] rounded-xl border border-[#2a3140] hover:border-[#3e485e] transition-colors gap-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-lg border ${lancamento.tipo === 'Receita' ? 'bg-[#10b981]/10 border-[#10b981]/20' : 'bg-[#ef4444]/10 border-[#ef4444]/20'}`}>
                      {lancamento.tipo === 'Receita' ? (
                        <TrendingUp className="w-5 h-5 text-[#10b981]" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-[#ef4444]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-200">{lancamento.descricao}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="text-gray-300">{lancamento.nome_categoria}</span> • {lancamento.nome_conta} • {formatDate(lancamento.data)}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className={`text-lg font-bold ${lancamento.tipo === 'Receita' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {lancamento.tipo === 'Receita' ? '+' : '-'} {formatCurrency(parseFloat(String(lancamento.valor)))}
                      </p>
                      <p className="text-xs mt-1">
                        {lancamento.pago ? (
                          <span className="text-[#10b981] flex items-center justify-end">
                            <Check className="w-3 h-3 mr-1" /> Pago
                          </span>
                        ) : (
                          <span className="text-[#eab308] flex items-center justify-end">
                            <X className="w-3 h-3 mr-1" /> Pendente
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile Value Display */}
                  <div className="flex justify-between items-center sm:hidden w-full border-t border-[#2a3140] pt-3 mt-1">
                    <p className={`text-base font-bold ${lancamento.tipo === 'Receita' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {lancamento.tipo === 'Receita' ? '+' : '-'}{formatCurrency(parseFloat(String(lancamento.valor)))}
                    </p>
                    <p className="text-xs">
                      {lancamento.pago ? (
                        <span className="text-[#10b981] flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Pago
                        </span>
                      ) : (
                        <span className="text-[#eab308] flex items-center">
                          <X className="w-3 h-3 mr-1" /> Pendente
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex space-x-2 sm:ml-4 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePago(lancamento)}
                      className="border-[#3e485e] hover:bg-[#2a3140] text-gray-300"
                    >
                      {lancamento.pago ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(lancamento)}
                      className="border-[#3e485e] hover:bg-[#2a3140] text-gray-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lancamento.id_lancamento)}
                      className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8 bg-[#12161f] border-[#222834] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <CardHeader className="border-b border-[#222834] bg-[#151a22]">
              <CardTitle className="text-gray-100">{editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Tipo</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-[#2a3140] bg-[#1a202c] px-3 py-1 text-sm text-gray-200 mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any, id_categoria: '' })}
                  >
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Conta</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-[#2a3140] bg-[#1a202c] px-3 py-1 text-sm text-gray-200 mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
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
                  <label className="text-sm font-medium text-gray-300">Categoria</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-[#2a3140] bg-[#1a202c] px-3 py-1 text-sm text-gray-200 mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
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
                  <label className="text-sm font-medium text-gray-300">Valor</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                    className="h-11 mt-1 border-[#2a3140] bg-[#1a202c] text-gray-200 focus-visible:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Data</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    className="h-11 mt-1 border-[#2a3140] bg-[#1a202c] text-gray-200 focus-visible:ring-yellow-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Descrição</label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                    className="h-11 mt-1 border-[#2a3140] bg-[#1a202c] text-gray-200 focus-visible:ring-yellow-500"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded border border-[#3e485e] bg-[#1a202c]">
                    <input
                      type="checkbox"
                      id="pago"
                      checked={formData.pago}
                      onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500 rounded"
                    />
                  </div>
                  <label htmlFor="pago" className="text-sm font-medium text-gray-300 cursor-pointer">Pago / Efetivado</label>
                </div>
                <div className="flex space-x-3 pt-4 border-t border-[#222834]">
                  <Button type="button" variant="outline" className="flex-1 border-[#3e485e] text-gray-300 hover:bg-[#1a202c]" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                    {editingLancamento ? 'Salvar' : 'Criar Lançamento'}
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

