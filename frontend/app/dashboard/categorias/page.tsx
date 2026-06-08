'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categoriasAPI, Categoria } from '@/lib/api'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Tag } from 'lucide-react'

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
      grupo_50_30_20: (categoria.grupo_50_30_20 ?? undefined) as 'Essencial' | 'Desejável' | 'Poupança' | undefined,
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

  const grupoStyle = (grupo: string) => {
    if (grupo === 'Essencial') return { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.25)' }
    if (grupo === 'Desejável') return { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: 'rgba(234,179,8,0.25)' }
    return { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
            <div className="p-2 rounded-xl" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <Tag className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </div>
            Categorias
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Organize suas receitas e despesas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'Receita', 'Despesa'] as const).map((tipo) => {
          const isActive = filtroTipo === tipo
          const labels: Record<string, string> = { '': 'Todas', 'Receita': 'Receitas', 'Despesa': 'Despesas' }
          const activeColors: Record<string, { bg: string, color: string, border: string }> = {
            '': { bg: 'var(--primary)', color: '#fff', border: 'var(--primary)' },
            'Receita': { bg: '#10b981', color: '#fff', border: '#10b981' },
            'Despesa': { bg: '#ef4444', color: '#fff', border: '#ef4444' },
          }
          const ac = activeColors[tipo]
          return (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={isActive
                ? { background: ac.bg, color: ac.color, border: `1px solid ${ac.border}` }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
              }
            >
              {tipo === 'Receita' && <TrendingUp className="w-4 h-4" />}
              {tipo === 'Despesa' && <TrendingDown className="w-4 h-4" />}
              {labels[tipo]}
            </button>
          )
        })}
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-8">

        {/* Receitas */}
        {(!filtroTipo || filtroTipo === 'Receita') && categoriasPorTipo.Receita.length > 0 && (
          <div>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              </span>
              Receitas
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
                {categoriasPorTipo.Receita.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Receita.map((categoria) => (
                <div
                  key={categoria.id_categoria}
                  className="group rounded-2xl p-4 transition-all hover:shadow-md"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Top bar color stripe */}
                  <div
                    className="h-1 w-full rounded-full mb-4"
                    style={{ background: `linear-gradient(90deg, ${categoria.cor || '#10b981'}, ${categoria.cor || '#10b981'}44)` }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: (categoria.cor || '#10b981') + '22', border: `1.5px solid ${(categoria.cor || '#10b981')}44` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: categoria.cor || '#10b981' }} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{categoria.nome}</span>
                  </div>
                  <div
                    className="flex gap-2 pt-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)' }}
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id_categoria)}
                      className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Despesas */}
        {(!filtroTipo || filtroTipo === 'Despesa') && categoriasPorTipo.Despesa.length > 0 && (
          <div>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <TrendingDown className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
              </span>
              Despesas
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444' }}>
                {categoriasPorTipo.Despesa.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasPorTipo.Despesa.map((categoria) => {
                const gs = grupoStyle(categoria.grupo_50_30_20 || '')
                return (
                  <div
                    key={categoria.id_categoria}
                    className="group rounded-2xl p-4 transition-all hover:shadow-md"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Top bar color stripe */}
                    <div
                      className="h-1 w-full rounded-full mb-4"
                      style={{ background: `linear-gradient(90deg, ${categoria.cor || '#ef4444'}, ${categoria.cor || '#ef4444'}44)` }}
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: (categoria.cor || '#ef4444') + '22', border: `1.5px solid ${(categoria.cor || '#ef4444')}44` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: categoria.cor || '#ef4444' }} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{categoria.nome}</span>
                    </div>
                    {categoria.grupo_50_30_20 && (
                      <div className="mb-3 ml-0.5">
                        <span
                          className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: gs.bg, color: gs.color, border: `1px solid ${gs.border}` }}
                        >
                          {categoria.grupo_50_30_20}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex gap-2 pt-3"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <button
                        onClick={() => handleEdit(categoria)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)' }}
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.id_categoria)}
                        className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {categorias.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Tag className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--foreground)' }}>Nenhuma categoria cadastrada</p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Crie sua primeira categoria para organizar seus lançamentos</p>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Criar primeira categoria
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {/* Modal header */}
            <div
              className="px-6 py-5"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}
            >
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {editingCategoria ? 'Atualize os dados da categoria' : 'Preencha as informações da nova categoria'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Nome</label>
                <input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Alimentação, Salário..."
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--input)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Tipo</label>
                <select
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                >
                  <option value="Receita">Receita</option>
                  <option value="Despesa">Despesa</option>
                </select>
              </div>

              {formData.tipo === 'Despesa' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Grupo 50/30/20</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
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
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Cor</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="h-10 w-14 rounded-xl cursor-pointer p-1"
                    style={{ border: '1px solid var(--border)', background: 'var(--input)' }}
                  />
                  <span className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>{formData.cor}</span>
                  <div className="w-8 h-8 rounded-lg ml-auto" style={{ backgroundColor: formData.cor }} />
                </div>
              </div>

              <div
                className="flex gap-3 pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {editingCategoria ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
