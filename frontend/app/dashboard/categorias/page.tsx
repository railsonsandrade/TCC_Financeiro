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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Categorias</h1>
          <p className="text-gray-400 mt-1">Organize suas receitas e despesas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <Button
          className={filtroTipo === '' ? 'bg-yellow-500 hover:bg-yellow-400 text-black font-semibold' : 'bg-[#1a202c] border border-[#2a3140] text-gray-300 hover:bg-[#222834] transition-colors'}
          onClick={() => setFiltroTipo('')}
        >
          Todas
        </Button>
        <Button
          className={filtroTipo === 'Receita' ? 'bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold flex items-center' : 'bg-[#1a202c] border border-[#2a3140] text-gray-300 hover:bg-[#222834] transition-colors flex items-center'}
          onClick={() => setFiltroTipo('Receita')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Receitas
        </Button>
        <Button
          className={filtroTipo === 'Despesa' ? 'bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-semibold flex items-center' : 'bg-[#1a202c] border border-[#2a3140] text-gray-300 hover:bg-[#222834] transition-colors flex items-center'}
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
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-50">
              <TrendingUp className="w-5 h-5 mr-2 text-[#10b981]" />
              Receitas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Receita.map((categoria) => (
                <Card key={categoria.id_categoria} className="bg-[#12161f] border-[#222834] hover:border-[#3e485e] hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: categoria.cor || '#10b981' }}
                        />
                        <span className="font-medium text-gray-200">{categoria.nome}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 border-t border-[#222834] pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#3e485e] text-gray-300 hover:bg-[#1a202c]"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
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
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-50">
              <TrendingDown className="w-5 h-5 mr-2 text-[#ef4444]" />
              Despesas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Despesa.map((categoria) => (
                <Card key={categoria.id_categoria} className="bg-[#12161f] border-[#222834] hover:border-[#3e485e] hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: categoria.cor || '#ef4444' }}
                        />
                        <span className="font-medium text-gray-200">{categoria.nome}</span>
                      </div>
                    </div>
                    {categoria.grupo_50_30_20 && (
                      <p className="text-xs text-gray-400 mb-3">
                        Grupo: <span className="text-gray-300">{categoria.grupo_50_30_20}</span>
                      </p>
                    )}
                    <div className="flex space-x-2 border-t border-[#222834] pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#3e485e] text-gray-300 hover:bg-[#1a202c]"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
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
        <Card className="bg-[#12161f] border-[#222834]">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma categoria cadastrada</p>
            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold" onClick={() => { resetForm(); setShowModal(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-[#12161f] border-[#222834] shadow-[0_0_40px_rgba(0,0,0,0.5)] my-8">
            <CardHeader className="border-b border-[#222834] bg-[#151a22]">
              <CardTitle className="text-gray-100">{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
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
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                {formData.tipo === 'Despesa' && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Grupo 50/30/20</label>
                    <select
                      className="flex h-11 w-full rounded-md border border-[#2a3140] bg-[#1a202c] px-3 py-1 text-sm text-gray-200 mt-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
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
