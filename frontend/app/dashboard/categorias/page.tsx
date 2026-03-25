'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categoriasAPI, Categoria } from '@/lib/api'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<'Receita' | 'Despesa' | ''>('')
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Despesa' as 'Receita' | 'Despesa',
    grupo_50_30_20: 'Essencial' as 'Essencial' | 'Desejável' | 'Poupança' | undefined,
    cor: '#3B82F6'
  })

  useEffect(() => {
    loadCategorias()
  }, [filtroTipo])

  const loadCategorias = async () => {
    try {
      setLoading(true)
      const response = await categoriasAPI.listar(filtroTipo || undefined)
      setCategorias(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        grupo_50_30_20: formData.tipo === 'Despesa' ? formData.grupo_50_30_20 : null
      }

      if (editingCategoria) {
        await categoriasAPI.atualizar(editingCategoria.id_categoria, data)
      } else {
        await categoriasAPI.criar(data)
      }
      setShowModal(false)
      resetForm()
      loadCategorias()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao criar categoria: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente desativar esta categoria?')) return
    try {
      await categoriasAPI.desativar(id)
      loadCategorias()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao desativar categoria')
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      grupo_50_30_20: categoria.grupo_50_30_20 ?? undefined,
      cor: categoria.cor || '#3B82F6'
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingCategoria(null)
    setFormData({
      nome: '',
      tipo: 'Despesa',
      grupo_50_30_20: 'Essencial',
      cor: '#3B82F6'
    })
  }

  const categoriasPorTipo = {
    Receita: categorias.filter(c => c.tipo === 'Receita'),
    Despesa: categorias.filter(c => c.tipo === 'Despesa')
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
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Organize suas receitas e despesas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <Button
          variant={filtroTipo === '' ? 'default' : 'outline'}
          onClick={() => setFiltroTipo('')}
        >
          Todas
        </Button>
        <Button
          variant={filtroTipo === 'Receita' ? 'default' : 'outline'}
          onClick={() => setFiltroTipo('Receita')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Receitas
        </Button>
        <Button
          variant={filtroTipo === 'Despesa' ? 'default' : 'outline'}
          onClick={() => setFiltroTipo('Despesa')}
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Despesas
        </Button>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-6">
        {(!filtroTipo || filtroTipo === 'Receita') && categoriasPorTipo.Receita.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Receitas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Receita.map((categoria) => (
                <Card key={categoria.id_categoria} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.cor || '#10b981' }}
                        />
                        <span className="font-medium">{categoria.nome}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(categoria.id_categoria)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!filtroTipo || filtroTipo === 'Despesa') && categoriasPorTipo.Despesa.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              Despesas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Despesa.map((categoria) => (
                <Card key={categoria.id_categoria} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.cor || '#ef4444' }}
                        />
                        <span className="font-medium">{categoria.nome}</span>
                      </div>
                    </div>
                    {categoria.grupo_50_30_20 && (
                      <p className="text-xs text-gray-600 mb-3">
                        {categoria.grupo_50_30_20}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(categoria.id_categoria)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {categorias.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Nenhuma categoria cadastrada</p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
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
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                {formData.tipo === 'Despesa' && (
                  <div>
                    <label className="text-sm font-medium">Grupo 50/30/20</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      value={formData.grupo_50_30_20}
                      onChange={(e) => setFormData({ ...formData, grupo_50_30_20: e.target.value as any })}
                    >
                      <option value="Essencial">Essencial (50%)</option>
                      <option value="Desejável">Desejável (30%)</option>
                      <option value="Poupança">Poupança (20%)</option>
                    </select>
                  </div>
                )}
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
                    {editingCategoria ? 'Salvar' : 'Criar'}
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

