'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, LayoutDashboard, Save, X, Pencil, RotateCcw,
  ChevronLeft, ChevronRight, CheckCircle, Loader2
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  contasAPI, lancamentosAPI, metasAPI, dashboardAPI,
  Conta, Meta, GastosPorCategoria, EvolucaoSaldo, DashboardWidget,
} from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  WidgetDef, WidgetConfig, DEFAULT_WIDGETS, getPeriodoDates,
} from '@/lib/dashboardHelpers'

import DashboardGrid from '@/components/dashboard/DashboardGrid'
import ModalCriarWidget from '@/components/dashboard/ModalCriarWidget'

// ─── nanoid polyfill (não depende do módulo externo se não instalado) ─────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function apiWidgetsToWidgetDefs(apiWidgets: DashboardWidget[]): WidgetDef[] {
  return apiWidgets.map(w => ({
    id_widget: w.id_widget,
    tipo: w.tipo,
    titulo: w.configuracao?.titulo || labelForTipo(w.tipo),
    x: w.x, y: w.y, w: w.w, h: w.h,
    configuracao: w.configuracao,
  }))
}

function labelForTipo(tipo: string): string {
  const map: Record<string, string> = {
    card_kpi: 'KPIs Financeiros',
    area_evolucao: 'Evolução de Saldo',
    pie_categoria: 'Categorias (Pizza)',
    bar_categoria: 'Top Categorias',
    metas: 'Metas em Andamento',
    contas: 'Minhas Contas',
    custom: 'Widget Personalizado',
  }
  return map[tipo] || tipo
}

function widgetDefsToApiWidgets(defs: WidgetDef[]): DashboardWidget[] {
  return defs.map(w => ({
    id_widget: w.id_widget,
    tipo: w.tipo,
    x: w.x, y: w.y, w: w.w, h: w.h,
    configuracao: w.configuracao ? { ...w.configuracao, titulo: w.titulo } : { titulo: w.titulo },
  }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Data states ──
  const [contas, setContas] = useState<Conta[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [gastos, setGastos] = useState<GastosPorCategoria[]>([])
  const [evolucao, setEvolucao] = useState<EvolucaoSaldo[]>([])
  const [totais, setTotais] = useState({ receitas: 0, despesas: 0, saldo: 0 })
  const [filtroTipo, setFiltroTipo] = useState<'mes' | 'periodo'>('periodo')
  const [periodoDate, setPeriodoDate] = useState(new Date())
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

  const [loading, setLoading] = useState(true)

  // ── Layout states ──
  const [widgets, setWidgets] = useState<WidgetDef[]>([])
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [layoutChanged, setLayoutChanged] = useState(false)

  // ── Modal states ──
  const [showModal, setShowModal] = useState(false)
  const [editingWidget, setEditingWidget] = useState<WidgetDef | null>(null)

  // ── Load data ────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadLayout()
  }, [])

  useEffect(() => {
    loadData()
  }, [periodoDate, dataInicio, dataFim, filtroTipo])

  const loadLayout = async () => {
    try {
      const resp = await dashboardAPI.obterLayout()
      if (resp.data && resp.data.length > 0) {
        setWidgets(apiWidgetsToWidgetDefs(resp.data))
      } else {
        setWidgets(DEFAULT_WIDGETS)
      }
    } catch {
      setWidgets(DEFAULT_WIDGETS)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const inicio = filtroTipo === 'mes' ? format(startOfMonth(periodoDate), 'yyyy-MM-dd') : dataInicio
      const fim = filtroTipo === 'mes' ? format(endOfMonth(periodoDate), 'yyyy-MM-dd') : dataFim
      const mesAno = format(periodoDate, 'yyyy-MM') // Analytics fixos ainda usam mes_ano

      const [contasRes, metasRes, gastosRes, evolucaoRes, lancsRes] = await Promise.allSettled([
        contasAPI.listarComSaldo(),
        metasAPI.listar('Em Andamento'),
        lancamentosAPI.obterGastosPorCategoria(mesAno),
        lancamentosAPI.obterEvolucaoSaldo(6),
        lancamentosAPI.listarComDetalhes({ data_inicio: inicio, data_fim: fim }),
      ])

      if (contasRes.status === 'fulfilled') setContas(contasRes.value.data)
      if (metasRes.status === 'fulfilled') setMetas(metasRes.value.data)
      if (gastosRes.status === 'fulfilled') setGastos(gastosRes.value.data)
      if (evolucaoRes.status === 'fulfilled') setEvolucao(evolucaoRes.value.data)

      if (lancsRes.status === 'fulfilled') {
        const lancs = lancsRes.value.data || []
        const pagos = lancs.filter((l: any) => l.pago)
        const rec = pagos.filter((l: any) => l.tipo === 'Receita').reduce((a: number, l: any) => a + parseFloat(l.valor || '0'), 0)
        const desp = pagos.filter((l: any) => l.tipo === 'Despesa').reduce((a: number, l: any) => a + parseFloat(l.valor || '0'), 0)
        setTotais({ receitas: rec, despesas: desp, saldo: rec - desp })
      }
    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Layout handlers ───────────────────────────────────────────────────────────

  const handleLayoutChange = useCallback((newLayout: any[]) => {
    setWidgets(prev => prev.map(w => {
      const item = newLayout.find((l: any) => l.i === w.id_widget)
      if (!item) return w
      return { ...w, x: item.x, y: item.y, w: item.w, h: item.h }
    }))
    setLayoutChanged(true)
  }, [])

  const handleSaveLayout = async () => {
    try {
      setSaving(true)
      await dashboardAPI.salvarLayout({ widgets: widgetDefsToApiWidgets(widgets) })
      setSaved(true)
      setLayoutChanged(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error('Erro ao salvar layout:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS)
    setLayoutChanged(true)
  }

  // ── Widget CRUD ───────────────────────────────────────────────────────────────

  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id_widget !== id))
    setLayoutChanged(true)
  }

  const handleEditWidget = (widget: WidgetDef) => {
    if (widget.tipo !== 'custom') return // só custom é editável via modal
    setEditingWidget(widget)
    setShowModal(true)
  }

  const handleSaveWidget = (config: WidgetConfig) => {
    if (editingWidget) {
      setWidgets(prev => prev.map(w =>
        w.id_widget === editingWidget.id_widget
          ? { ...w, titulo: config.titulo, configuracao: config }
          : w
      ))
    } else {
      const newWidget: WidgetDef = {
        id_widget: `custom-${uid()}`,
        tipo: 'custom',
        titulo: config.titulo,
        x: 0,
        y: 999, // Safely append at the bottom without breaking backend ints
        w: 6,
        h: 5,
        configuracao: config,
      }
      setWidgets(prev => [...prev, newWidget])
    }
    setLayoutChanged(true)
    setShowModal(false)
    setEditingWidget(null)
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  const saldoTotal = contas.reduce((acc, c) => acc + parseFloat(String(c.saldo_atual ?? c.saldo_inicial ?? 0)), 0)
  const prevMonth = () => setPeriodoDate(p => addMonths(p, -1))
  const nextMonth = () => setPeriodoDate(p => addMonths(p, 1))

  // ── Props for widgets ──
  const globalFilter = {
    tipo: filtroTipo,
    mes: periodoDate,
    data_inicio: filtroTipo === 'mes' ? format(startOfMonth(periodoDate), 'yyyy-MM-dd') : dataInicio,
    data_fim: filtroTipo === 'mes' ? format(endOfMonth(periodoDate), 'yyyy-MM-dd') : dataFim
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-50 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-yellow-400" />
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Visão geral e personalizável das suas finanças</p>
        </div>

        {/* Period selector */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-[#12161f] border border-[#222834] rounded-lg p-1">
            <button 
              onClick={() => setFiltroTipo('mes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filtroTipo === 'mes' ? 'bg-[#2a3140] text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            >Mensal</button>
            <button 
              onClick={() => setFiltroTipo('periodo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filtroTipo === 'periodo' ? 'bg-[#2a3140] text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
            >Período</button>
          </div>

          {filtroTipo === 'mes' ? (
            <div className="flex items-center gap-2 bg-[#12161f] border border-[#222834] rounded-xl px-3 py-2">
              <button onClick={prevMonth} className="p-1 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-100 min-w-[120px] text-center capitalize">
                {format(periodoDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <button onClick={nextMonth} className="p-1 text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#12161f] border border-[#222834] rounded-xl px-3 py-1.5">
              <input 
                type="date" 
                value={dataInicio} 
                onChange={e => setDataInicio(e.target.value)}
                className="bg-transparent text-sm text-gray-200 outline-none w-auto"
              />
              <span className="text-gray-500 text-sm">até</span>
              <input 
                type="date" 
                value={dataFim} 
                onChange={e => setDataFim(e.target.value)}
                className="bg-transparent text-sm text-gray-200 outline-none w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Botão Editar / Concluir */}
          <button
            onClick={() => {
              if (editMode && layoutChanged) handleSaveLayout()
              setEditMode(v => !v)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              editMode
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-[#12161f] border-[#222834] text-gray-300 hover:border-gray-500 hover:text-white'
            }`}
          >
            {editMode ? <><X className="w-4 h-4" /> Concluir Edição</> : <><Pencil className="w-4 h-4" /> Editar Layout</>}
          </button>

          {/* Adicionar Widget */}
          <button
            onClick={() => { setEditingWidget(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Widget
          </button>

          {/* Reset */}
          {editMode && (
            <button
              onClick={handleResetLayout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-orange-400 border border-[#222834] hover:border-orange-500/50 bg-[#12161f] transition-colors"
              title="Resetar para layout padrão"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Save status */}
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-fade-in">
              <CheckCircle className="w-4 h-4" /> Layout salvo!
            </span>
          )}
          {layoutChanged && !saved && (
            <button
              onClick={handleSaveLayout}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar Layout'}
            </button>
          )}
        </div>
      </div>

      {/* ── Edit mode banner ── */}
      {editMode && (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-300 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Modo edição ativo — arraste os widgets para reposicioná-los e redimensione pelas bordas. Clique em <strong className="text-yellow-400">Concluir Edição</strong> para salvar automaticamente.
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Carregando dados...</p>
          </div>
        </div>
      ) : (
        <DashboardGrid
          widgets={widgets}
          editMode={editMode}
          onLayoutChange={handleLayoutChange}
          onEditWidget={handleEditWidget}
          onDeleteWidget={handleDeleteWidget}
          contas={contas}
          metas={metas}
          gastosPorCategoria={gastos}
          evolucaoSaldo={evolucao}
          saldoTotal={saldoTotal}
          totalReceitas={totais.receitas}
          totalDespesas={totais.despesas}
          saldoMes={totais.saldo}
          globalFilter={globalFilter}
        />
      )}

      {/* ── Modal Criar / Editar Widget ── */}
      {showModal && (
        <ModalCriarWidget
          onClose={() => { setShowModal(false); setEditingWidget(null) }}
          onSave={handleSaveWidget}
          initialConfig={editingWidget?.configuracao as Partial<WidgetConfig>}
        />
      )}
    </div>
  )
}
