'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  importacaoAPI, contasAPI, categoriasAPI,
  Conta, Categoria, ImportResult,
  PreviewItem, ConfirmItem
} from '@/lib/api'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle,
  X, ArrowRight, Loader2, CreditCard, Download,
  File as FileIcon, Info, Eye, Pencil, ChevronDown,
  Check, Search,
} from 'lucide-react'

// Editable row type extends PreviewItem with user edits
interface EditableItem extends PreviewItem {
  category: string
  grupo: string
  selected: boolean
}

export default function ImportarPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [selectedConta, setSelectedConta] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'configure' | 'review' | 'result'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview / Review state
  const [editableItems, setEditableItems] = useState<EditableItem[]>([])
  const [selectAll, setSelectAll] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [customCategory, setCustomCategory] = useState('')

  useEffect(() => {
    loadContas()
    loadCategorias()
  }, [])

  const loadContas = async () => {
    try { setContas((await contasAPI.listar()).data) } catch {}
  }
  const loadCategorias = async () => {
    try { setCategorias((await categoriasAPI.listar()).data) } catch {}
  }

  // ─── file handling ────────────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.CSV'))) {
      setFile(f); setStep('configure'); setError(null)
    } else {
      setError('Por favor, selecione um arquivo CSV')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setStep('configure'); setError(null) }
  }

  // ─── preview ──────────────────────────────────────────────────────────

  const handlePreview = async () => {
    if (!file || !selectedConta) return
    setPreviewLoading(true); setError(null)

    try {
      const res = await importacaoAPI.previewNubank(file)
      const items: EditableItem[] = res.data.items.map(item => ({
        ...item,
        category: item.suggested_category,
        grupo: item.suggested_grupo,
        selected: true,
      }))
      setEditableItems(items)
      setSelectAll(true)
      setStep('review')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao analisar o arquivo CSV.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // ─── confirm import ──────────────────────────────────────────────────

  const handleConfirmImport = async () => {
    setLoading(true); setError(null)

    const selected = editableItems.filter(i => i.selected)
    if (selected.length === 0) {
      setError('Selecione ao menos um lançamento para importar.')
      setLoading(false); return
    }

    try {
      const confirmItems: ConfirmItem[] = selected.map(i => ({
        date: i.date,
        title: i.title,
        amount: i.amount,
        tipo: i.tipo,
        category: i.category,
        grupo: i.grupo,
      }))

      const res = await importacaoAPI.confirmarNubank({
        id_conta: parseInt(selectedConta),
        items: confirmItems,
      })

      setResult(res.data)
      setStep('result')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao confirmar importação.')
    } finally {
      setLoading(false)
    }
  }

  // ─── helpers ──────────────────────────────────────────────────────────

  const resetState = () => {
    setFile(null); setSelectedConta(''); setResult(null); setError(null)
    setStep('upload'); setEditableItems([]); setEditingIdx(null)
  }

  const toggleSelectAll = () => {
    const next = !selectAll
    setSelectAll(next)
    setEditableItems(prev => prev.map(i => ({ ...i, selected: next })))
  }

  const toggleItem = (idx: number) => {
    setEditableItems(prev => prev.map((i, j) => j === idx ? { ...i, selected: !i.selected } : i))
  }

  const updateCategory = (idx: number, category: string) => {
    setEditableItems(prev => prev.map((i, j) => j === idx ? { ...i, category } : i))
    setEditingIdx(null)
    setCustomCategory('')
  }

  const updateTipo = (idx: number, tipo: string) => {
    setEditableItems(prev => prev.map((i, j) => j === idx ? { ...i, tipo } : i))
  }

  const filteredItems = editableItems.filter(i =>
    i.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    i.category.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const totalSelecionados = editableItems.filter(i => i.selected).length
  const totalValor = editableItems.filter(i => i.selected).reduce((s, i) => s + i.amount, 0)

  // Unique categories: existing user categories + suggested ones
  const allCategories = Array.from(new Set([
    ...categorias.map(c => c.nome),
    ...editableItems.map(i => i.category),
    'Alimentação', 'Transporte', 'Saúde e Farmácia', 'Assinaturas',
    'Compras', 'Educação', 'Lazer', 'Viagem', 'Outros',
  ])).sort()

  const steps = [
    { key: 'upload', label: '1. Upload', icon: Upload },
    { key: 'configure', label: '2. Configurar', icon: CreditCard },
    { key: 'review', label: '3. Revisar', icon: Eye },
    { key: 'result', label: '4. Resultado', icon: CheckCircle2 },
  ]

  const stepOrder = ['upload', 'configure', 'review', 'result']

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Upload className="w-6 h-6 text-yellow-500" />
          </div>
          Importar Fatura
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Importe suas faturas bancárias com categorização inteligente</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.key
          const isPast = stepOrder.indexOf(step) > stepOrder.indexOf(s.key)
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive ? { background: 'rgba(234,179,8,0.1)', color: 'var(--primary)', border: '1px solid rgba(234,179,8,0.25)' } :
                  isPast ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' } :
                  { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
                }
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 border rounded-xl text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 opacity-80 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* ─── Step 1: Upload ────────────────────────────────────────────── */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div
            className="border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
            style={
              dragActive
                ? { borderColor: 'var(--primary)', background: 'rgba(234,179,8,0.1)' }
                : { borderColor: 'var(--border)', background: 'var(--card)' }
            }
            onMouseEnter={e => { if (!dragActive) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--muted)' } }}
            onMouseLeave={e => { if (!dragActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)' } }}
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".csv,.ofx" onChange={handleFileSelect} className="hidden" />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <FileSpreadsheet className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Arraste o arquivo CSV aqui ou clique para selecionar</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Suporte: Nubank (.csv)</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Como exportar sua fatura do Nubank:</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <li>Abra o app do Nubank</li>
                <li>Vá em Cartão de Crédito &gt; Faturas</li>
                <li>Selecione a fatura desejada</li>
                <li>Toque nos 3 pontinhos &gt; Exportar fatura (CSV)</li>
                <li>Importe o arquivo aqui</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 2: Configure ──────────────────────────────────────────── */}
      {step === 'configure' && file && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="p-3 bg-[#10b981]/10 rounded-xl border border-[#10b981]/25">
              <FileIcon className="w-6 h-6 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{file.name}</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={resetState}
              className="p-2 rounded-lg transition-colors border border-transparent"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Selecione a conta destino
            </h3>
            <select
              value={selectedConta}
              onChange={(e) => setSelectedConta(e.target.value)}
              className="w-full h-11 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              <option value="">Selecione uma conta...</option>
              {contas.map((c) => (
                <option key={c.id_conta} value={c.id_conta}>{c.nome} ({c.tipo})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all border"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
              onClick={resetState}
            >
              Voltar
            </button>
            <button
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50"
              disabled={!selectedConta || previewLoading}
              onClick={handlePreview}
            >
              {previewLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" /> Analisar Lançamentos</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review ─────────────────────────────────────────────── */}
      {step === 'review' && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted-foreground)' }}>Total de itens</p>
                <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{editableItems.length}</p>
              </div>
              <div className="h-8 w-px" style={{ background: 'var(--border)' }} />
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted-foreground)' }}>Selecionados</p>
                <p className="text-xl font-bold text-yellow-500">{totalSelecionados}</p>
              </div>
              <div className="h-8 w-px" style={{ background: 'var(--border)' }} />
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted-foreground)' }}>Valor Total</p>
                <p className="text-xl font-bold text-[#10b981]">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-9 pl-9 pr-4 w-56 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 cursor-pointer accent-yellow-500"
                        style={{ border: '1px solid var(--border)', background: 'var(--muted)' }}
                      />
                    </th>
                    <th className="p-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Data</th>
                    <th className="p-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Descrição</th>
                    <th className="p-3 font-semibold text-right" style={{ color: 'var(--muted-foreground)' }}>Valor</th>
                    <th className="p-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Tipo</th>
                    <th className="p-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, displayIdx) => {
                    const realIdx = editableItems.indexOf(item)
                    const isEditing = editingIdx === realIdx
                    return (
                      <tr
                        key={realIdx}
                        className="transition-colors"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          opacity: item.selected ? 1 : 0.5,
                          background: item.selected ? 'transparent' : 'rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => { if (item.selected) e.currentTarget.style.background = 'var(--muted)' }}
                        onMouseLeave={e => { if (item.selected) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(realIdx)}
                            className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 cursor-pointer accent-yellow-500"
                            style={{ border: '1px solid var(--border)', background: 'var(--muted)' }}
                          />
                        </td>
                        <td className="whitespace-nowrap font-mono text-xs p-3 font-semibold" style={{ color: 'var(--foreground)' }}>
                          {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 font-medium max-w-[240px] truncate" style={{ color: 'var(--foreground)' }} title={item.title}>
                          {item.title}
                        </td>
                        <td className={`p-3 text-right font-semibold whitespace-nowrap ${
                          item.tipo === 'Receita' ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}>
                          {item.tipo === 'Receita' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <select
                            value={item.tipo}
                            onChange={(e) => updateTipo(realIdx, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
                              item.tipo === 'Receita'
                                ? 'bg-[#10b981]/15 text-[#10b981]'
                                : 'bg-[#ef4444]/15 text-[#ef4444]'
                            }`}
                          >
                            <option value="Despesa">Despesa</option>
                            <option value="Receita">Receita</option>
                          </select>
                        </td>
                        <td className="p-3 relative">
                          {isEditing ? (
                            <div className="flex flex-col gap-1">
                              <select
                                value={item.category}
                                onChange={(e) => {
                                  if (e.target.value === '__custom__') {
                                    setCustomCategory('')
                                  } else {
                                    updateCategory(realIdx, e.target.value)
                                  }
                                }}
                                className="h-8 px-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                                autoFocus
                              >
                                {allCategories.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__custom__">+ Nova categoria...</option>
                              </select>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={customCategory}
                                  onChange={(e) => setCustomCategory(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customCategory.trim()) {
                                      updateCategory(realIdx, customCategory.trim())
                                    }
                                  }}
                                  placeholder="Ou digite nova..."
                                  className="flex-1 h-7 px-2 rounded-md text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                                />
                                {customCategory.trim() && (
                                  <button
                                    onClick={() => updateCategory(realIdx, customCategory.trim())}
                                    className="h-7 w-7 flex items-center justify-center rounded-md bg-yellow-500 text-black hover:bg-yellow-400"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingIdx(realIdx); setCustomCategory('') }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all group"
                              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)' }}
                            >
                              <span className="truncate max-w-[140px]">{item.category}</span>
                              <Pencil className="w-3 h-3 text-gray-600 group-hover:text-yellow-500 shrink-0" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
              onClick={() => setStep('configure')}
            >
              Voltar
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50"
              disabled={loading || totalSelecionados === 0}
              onClick={handleConfirmImport}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando {totalSelecionados} itens...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Importar {totalSelecionados} Lançamentos</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 4: Result ─────────────────────────────────────────────── */}
      {step === 'result' && result && (
        <div className="space-y-6">
          <div className="rounded-2xl p-8 text-center space-y-4 shadow-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mx-auto w-16 h-16 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Importação Concluída!</h3>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
              <div className="bg-[#10b981]/10 rounded-xl p-4 border border-[#10b981]/20">
                <p className="text-3xl font-bold text-[#10b981]">{result.total_importados}</p>
                <p className="text-sm text-[#10b981]/80 mt-1">Importados</p>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <p className="text-3xl font-bold text-yellow-500">{result.total_duplicados}</p>
                <p className="text-sm text-yellow-500/80 mt-1">Duplicados</p>
              </div>
            </div>

            {result.erros && result.erros.length > 0 && (
              <div className="border rounded-xl p-4 text-left mt-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                <p className="text-sm font-medium mb-2">Erros encontrados:</p>
                <ul className="text-sm space-y-1">
                  {result.erros.map((erro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all text-black bg-yellow-500 hover:bg-yellow-400"
            onClick={resetState}
          >
            Importar outro arquivo
          </button>
        </div>
      )}
    </div>
  )
}
