'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { metasAPI, Meta } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Target, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'Em Andamento' | 'Concluída' | 'Cancelada' | ''>('')
  const [formData, setFormData] = useState({
    nome: '',
    valor_alvo: '',
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
      const data = {
        ...formData,
        data_fim_prev: formData.data_fim_prev || undefined
      }
      
      if (editingMeta) {
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
      data_inicio: format(new Date(), 'yyyy-MM-dd'),
      data_fim_prev: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-blue-600 bg-blue-50'
      case 'Concluída': return 'text-green-600 bg-green-50'
      case 'Cancelada': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-600 mt-1">Defina e acompanhe seus objetivos</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <Button 
          variant={filtroStatus === '' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('')}
        >
          Todas
        </Button>
        <Button 
          variant={filtroStatus === 'Em Andamento' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('Em Andamento')}
        >
          Em Andamento
        </Button>
        <Button 
          variant={filtroStatus === 'Concluída' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('Concluída')}
        >
          Concluídas
        </Button>
        <Button 
          variant={filtroStatus === 'Cancelada' ? 'default' : 'outline'}
          onClick={() => setFiltroStatus('Cancelada')}
        >
          Canceladas
        </Button>
      </div>

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metas.map((meta) => (
          <Card key={meta.id_meta} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  {meta.nome}
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meta.status)}`}>
                  {meta.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Progresso</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(parseFloat(meta.valor_atual || '0'))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(parseFloat(meta.valor_alvo))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(meta.percentual_atingido || 0, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  {meta.percentual_atingido?.toFixed(1) || 0}% atingido
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Início</p>
                  <p className="font-medium">{formatDate(meta.data_inicio)}</p>
                </div>
                {meta.data_fim_prev && (
                  <div>
                    <p className="text-gray-600">Previsão</p>
                    <p className="font-medium">{formatDate(meta.data_fim_prev)}</p>
                  </div>
                )}
              </div>

              {meta.valor_faltante && parseFloat(meta.valor_faltante) > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Faltam</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(parseFloat(meta.valor_faltante))}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                {meta.status === 'Em Andamento' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(meta)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleConcluir(meta.id_meta)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluir
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelar(meta.id_meta)}
                    >
                      <XCircle className="w-3 h-3" />
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
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma meta cadastrada</p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingMeta ? 'Editar Meta' : 'Nova Meta'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Meta</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Viagem para Europa"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valor Alvo</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_alvo}
                    onChange={(e) => setFormData({ ...formData, valor_alvo: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Início</label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Prevista (Opcional)</label>
                  <Input
                    type="date"
                    value={formData.data_fim_prev}
                    onChange={(e) => setFormData({ ...formData, data_fim_prev: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingMeta ? 'Salvar' : 'Criar'}
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

