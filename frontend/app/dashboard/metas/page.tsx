'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { metasAPI, Meta } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Target, CheckCircle, XCircle, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAddValueModal, setShowAddValueModal] = useState(false)
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null)
  const [addValueAmount, setAddValueAmount] = useState('')
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'Em Andamento' | 'Concluída' | 'Cancelada' | ''>('')
  const [formData, setFormData] = useState({
    nome: '',
    valor_alvo: '',
    valor_atual: '',
    data_inicio: format(new Date(), 'yyyy-MM-dd'),
    data_fim_prev: ''
  })

  useEffect(() => {
    loadMetas()
  }, [filtroStatus])

  const loadMetas = async () => {
    try {
      setLoading(true)
      const response = await metasAPI.listar(filtroStatus || undefined)
      setMetas(response.data)
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: any = {
        nome: formData.nome,
        valor_alvo: formData.valor_alvo,
        data_inicio: formData.data_inicio,
        data_fim_prev: formData.data_fim_prev || undefined,
      }
      
      if (!editingMeta && formData.valor_atual) {
        data.valor_atual = formData.valor_atual
      }
      
      if (editingMeta) {
        if (formData.valor_atual) {
          data.valor_atual = formData.valor_atual
        }
        await metasAPI.atualizar(editingMeta.id_meta, data)
      } else {
        await metasAPI.criar(data)
      }
      setShowModal(false)
      resetForm()
      loadMetas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao salvar meta')
    }
  }

  const handleAddValue = async () => {
    if (!selectedMeta || !addValueAmount || parseFloat(addValueAmount) <= 0) return
    try {
      // Use the existing adicionar-valor endpoint
      const response = await metasAPI.adicionarValor(selectedMeta.id_meta, parseFloat(addValueAmount))
      setShowAddValueModal(false)
      setAddValueAmount('')
      setSelectedMeta(null)
      loadMetas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao adicionar valor')
    }
  }

  const openAddValueModal = (meta: Meta) => {
    setSelectedMeta(meta)
    setAddValueAmount('')
    setShowAddValueModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta meta?')) return
    try {
      await metasAPI.deletar(id)
      loadMetas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao excluir meta')
    }
  }

  const handleConcluir = async (id: number) => {
    try {
      await metasAPI.concluir(id)
      loadMetas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao concluir meta')
    }
  }

  const handleCancelar = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta meta?')) return
    try {
      await metasAPI.cancelar(id)
      loadMetas()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao cancelar meta')
    }
  }

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta)
    setFormData({
      nome: meta.nome,
      valor_alvo: meta.valor_alvo,
      valor_atual: meta.valor_atual || '',
      data_inicio: meta.data_inicio,
      data_fim_prev: meta.data_fim_prev || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingMeta(null)
    setFormData({
      nome: '',
      valor_alvo: '',
      valor_atual: '',
      data_inicio: format(new Date(), 'yyyy-MM-dd'),
      data_fim_prev: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-sky-600 bg-sky-50 border-sky-200'
      case 'Concluída': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'Cancelada': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'from-emerald-400 to-emerald-600'
    if (percent >= 70) return 'from-sky-400 to-sky-600'
    if (percent >= 40) return 'from-amber-400 to-amber-500'
    return 'from-orange-400 to-orange-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-500 mt-1">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-sky-600 hover:bg-sky-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'Todas' },
          { value: 'Em Andamento', label: 'Em Andamento' },
          { value: 'Concluída', label: 'Concluídas' },
          { value: 'Cancelada', label: 'Canceladas' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroStatus(f.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filtroStatus === f.value
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metas.map((meta) => {
          const percent = Math.min(meta.percentual_atingido || 0, 100)
          return (
            <div
              key={meta.id_meta}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Progress bar at top */}
              <div className="h-1.5 bg-gray-100">
                <div
                  className={`h-full rounded-r-full bg-gradient-to-r ${getProgressColor(percent)} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-50 rounded-xl">
                      <Target className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{meta.nome}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(meta.status)}`}>
                        {meta.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${percent >= 100 ? 'text-emerald-600' : 'text-sky-600'}`}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Values */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Valor atual
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(parseFloat(meta.valor_atual || '0'))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Meta
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency(parseFloat(meta.valor_alvo))}
                    </span>
                  </div>
                  {meta.valor_faltante && parseFloat(meta.valor_faltante) > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Faltam
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        {formatCurrency(parseFloat(meta.valor_faltante))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${getProgressColor(percent)} h-2.5 rounded-full transition-all duration-700`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Início: {formatDate(meta.data_inicio)}
                  </span>
                  {meta.data_fim_prev && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Previsão: {formatDate(meta.data_fim_prev)}
                    </span>
                  )}
                  {meta.dias_restantes !== null && meta.dias_restantes !== undefined && meta.dias_restantes > 0 && (
                    <span className="ml-auto text-amber-600 font-medium">
                      {meta.dias_restantes} dias restantes
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {meta.status === 'Em Andamento' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-sky-600 border-sky-200 hover:bg-sky-50"
                        onClick={() => openAddValueModal(meta)}
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                        Adicionar Valor
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(meta)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleConcluir(meta.id_meta)}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelar(meta.id_meta)}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {meta.status !== 'Em Andamento' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(meta.id_meta)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {metas.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-sky-400" />
            </div>
            <p className="text-gray-500 text-lg">Nenhuma meta cadastrada</p>
            <p className="text-gray-400 text-sm mt-1">Crie sua primeira meta financeira para começar</p>
            <Button className="mt-6 bg-sky-600 hover:bg-sky-700" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira meta
            </Button>
          </div>
        </div>
      )}

      {/* Modal - Criar/Editar Meta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-600" />
                {editingMeta ? 'Editar Meta' : 'Nova Meta'}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome da Meta</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Viagem para Europa"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valor Alvo (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_alvo}
                      onChange={(e) => setFormData({ ...formData, valor_alvo: e.target.value })}
                      placeholder="5.000,00"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valor Inicial (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_atual}
                      onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })}
                      placeholder="0,00"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">Quanto já guardou</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data de Início</label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Previsão (Opcional)</label>
                    <Input
                      type="date"
                      value={formData.data_fim_prev}
                      onChange={(e) => setFormData({ ...formData, data_fim_prev: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                    {editingMeta ? 'Salvar' : 'Criar Meta'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Adicionar Valor */}
      {showAddValueModal && selectedMeta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Adicionar Valor
              </h3>
              <p className="text-sm text-gray-500 mt-1">{selectedMeta.nome}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Current Progress */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Atual</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(parseFloat(selectedMeta.valor_atual || '0'))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Meta</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(parseFloat(selectedMeta.valor_alvo))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(selectedMeta.percentual_atingido || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Add Value Input */}
              <div>
                <label className="text-sm font-medium text-gray-700">Valor a adicionar (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addValueAmount}
                  onChange={(e) => setAddValueAmount(e.target.value)}
                  placeholder="100,00"
                  className="mt-1 text-lg font-semibold"
                  autoFocus
                />
              </div>

              {/* Preview */}
              {addValueAmount && parseFloat(addValueAmount) > 0 && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-sm text-emerald-700">
                    <span className="font-medium">Após adição:</span>{' '}
                    {formatCurrency(parseFloat(selectedMeta.valor_atual || '0') + parseFloat(addValueAmount))}
                    {' / '}
                    {formatCurrency(parseFloat(selectedMeta.valor_alvo))}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {Math.min(
                      (((parseFloat(selectedMeta.valor_atual || '0') + parseFloat(addValueAmount)) / parseFloat(selectedMeta.valor_alvo)) * 100),
                      100
                    ).toFixed(1)}% da meta
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddValueModal(false)
                    setSelectedMeta(null)
                    setAddValueAmount('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAddValue}
                  disabled={!addValueAmount || parseFloat(addValueAmount) <= 0}
                >
                  <DollarSign className="w-4 h-4 mr-1.5" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
