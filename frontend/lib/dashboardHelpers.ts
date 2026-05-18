import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChartType = 'bar' | 'bar_horizontal' | 'pie' | 'donut' | 'line' | 'area' | 'number'
export type AgruparPor = 'categoria' | 'tipo' | 'conta' | 'mes' | 'grupo_50_30_20'
export type Medida = 'valor' | 'quantidade'
export type Periodo =
  | 'mes_atual'
  | 'mes_passado'
  | 'mes_atual_vs_anterior'
  | 'ultimos_3_meses'
  | 'ultimos_6_meses'
  | 'ano_atual'

export interface WidgetConfig {
  titulo: string
  agruparPor: AgruparPor
  medida: Medida
  tipoGrafico: ChartType
  periodo: Periodo
  filtroTipo?: 'Receita' | 'Despesa' | 'Todos'
  filtroCategoria?: string
  topN?: number
  cor: string
}

export interface WidgetDef {
  id_widget: string
  tipo: string
  titulo?: string
  x: number
  y: number
  w: number
  h: number
  configuracao?: Partial<WidgetConfig>
}

// ─── Layout Padrão ────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: WidgetDef[] = [
  { id_widget: 'kpi-resumo',      tipo: 'card_kpi',       titulo: 'Resumo Financeiro',         x: 0, y: 0,  w: 12, h: 3 },
  { id_widget: 'metas',           tipo: 'metas',          titulo: 'Progresso das Metas',       x: 0, y: 3,  w: 4,  h: 5 },
  { id_widget: 'contas',          tipo: 'contas',         titulo: 'Saldos das Contas',         x: 4, y: 3,  w: 4,  h: 5 },
  { id_widget: 'top-gastos',      tipo: 'custom',         titulo: 'Maiores Despesas',          x: 8, y: 3,  w: 4,  h: 5, configuracao: { titulo: 'Maiores Despesas', tipoGrafico: 'bar_horizontal', agruparPor: 'categoria', medida: 'valor', periodo: 'mes_atual', filtroTipo: 'Despesa', topN: 5, cor: '#f43f5e' } },
  { id_widget: 'pizza-receita',   tipo: 'custom',         titulo: 'Receitas vs Despesas',      x: 0, y: 8,  w: 6,  h: 5, configuracao: { titulo: 'Receitas vs Despesas', tipoGrafico: 'donut', agruparPor: 'tipo', medida: 'valor', periodo: 'mes_atual', filtroTipo: 'Todos', topN: 5, cor: '#10b981' } },
  { id_widget: 'evolucao-area',   tipo: 'area_evolucao',  titulo: 'Evolução de Saldo',         x: 6, y: 8,  w: 6,  h: 5 },
]

// ─── Helpers de Período ────────────────────────────────────────────────────────

export function getPeriodoDates(periodo: Periodo, base = new Date()) {
  switch (periodo) {
    case 'mes_atual':
      return { inicio: format(startOfMonth(base), 'yyyy-MM-dd'), fim: format(endOfMonth(base), 'yyyy-MM-dd'), label: format(base, 'MMMM/yy', { locale: ptBR }) }
    case 'mes_passado': {
      const prev = subMonths(base, 1)
      return { inicio: format(startOfMonth(prev), 'yyyy-MM-dd'), fim: format(endOfMonth(prev), 'yyyy-MM-dd'), label: format(prev, 'MMMM/yy', { locale: ptBR }) }
    }
    case 'ultimos_3_meses':
      return { inicio: format(startOfMonth(subMonths(base, 2)), 'yyyy-MM-dd'), fim: format(endOfMonth(base), 'yyyy-MM-dd'), label: 'Últimos 3 meses' }
    case 'ultimos_6_meses':
      return { inicio: format(startOfMonth(subMonths(base, 5)), 'yyyy-MM-dd'), fim: format(endOfMonth(base), 'yyyy-MM-dd'), label: 'Últimos 6 meses' }
    case 'ano_atual':
      return { inicio: `${base.getFullYear()}-01-01`, fim: `${base.getFullYear()}-12-31`, label: `Ano ${base.getFullYear()}` }
    case 'mes_atual_vs_anterior':
      return { inicio: format(startOfMonth(subMonths(base, 1)), 'yyyy-MM-dd'), fim: format(endOfMonth(base), 'yyyy-MM-dd'), label: 'Este mês vs anterior' }
    default:
      return { inicio: format(startOfMonth(base), 'yyyy-MM-dd'), fim: format(endOfMonth(base), 'yyyy-MM-dd'), label: '' }
  }
}

// ─── Construção de dados para gráfico ─────────────────────────────────────────

function getGroupKey(lancamento: any, agruparPor: AgruparPor): string {
  switch (agruparPor) {
    case 'categoria': return lancamento.nome_categoria || 'Sem categoria'
    case 'tipo':      return lancamento.tipo || 'Desconhecido'
    case 'conta':     return lancamento.nome_conta || 'Sem conta'
    case 'mes':       return lancamento.data?.slice(0, 7) || 'Sem data'
    case 'grupo_50_30_20': return lancamento.grupo_categoria || 'Outros'
    default: return 'Outros'
  }
}

export function buildChartData(lancamentos: any[], config: WidgetConfig): { nome: string; valor: number }[] {
  const filtrados = lancamentos.filter((l: any) => {
    if (config.filtroTipo && config.filtroTipo !== 'Todos') if (l.tipo !== config.filtroTipo) return false
    if (config.filtroCategoria) if (l.nome_categoria !== config.filtroCategoria) return false
    return true
  })

  const grouped: Record<string, number> = {}
  for (const l of filtrados) {
    const key = getGroupKey(l, config.agruparPor)
    grouped[key] = (grouped[key] || 0) + (config.medida === 'valor' ? parseFloat(l.valor || '0') : 1)
  }

  let result = Object.entries(grouped)
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor)

  if (config.topN) result = result.slice(0, config.topN)
  return result
}

export function buildComparisonData(
  lancamentosA: any[], lancamentosB: any[],
  config: WidgetConfig, labelA: string, labelB: string
): { nome: string; [k: string]: number | string }[] {
  const dataA = buildChartData(lancamentosA, config)
  const dataB = buildChartData(lancamentosB, config)
  const nomes = Array.from(new Set([...dataA.map(d => d.nome), ...dataB.map(d => d.nome)]))
  const mapA = Object.fromEntries(dataA.map(d => [d.nome, d.valor]))
  const mapB = Object.fromEntries(dataB.map(d => [d.nome, d.valor]))
  return nomes.map(nome => ({ nome, [labelA]: mapA[nome] || 0, [labelB]: mapB[nome] || 0 }))
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

export const CHART_COLORS_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#f43f5e', '#eab308', '#0ea5e9',
]

export const PERIOD_OPTIONS: { value: Periodo; label: string }[] = [
  { value: 'mes_atual',            label: 'Este mês' },
  { value: 'mes_passado',          label: 'Mês passado' },
  { value: 'mes_atual_vs_anterior',label: 'Este mês vs mês anterior' },
  { value: 'ultimos_3_meses',      label: 'Últimos 3 meses' },
  { value: 'ultimos_6_meses',      label: 'Últimos 6 meses' },
  { value: 'ano_atual',            label: 'Ano atual' },
]

export const AGRUPAR_OPTIONS: { value: AgruparPor; label: string; desc: string }[] = [
  { value: 'categoria',     label: 'Categoria',    desc: 'Alimentação, Transporte, Lazer...' },
  { value: 'tipo',          label: 'Tipo',         desc: 'Receita ou Despesa' },
  { value: 'conta',         label: 'Conta',        desc: 'Por conta bancária' },
  { value: 'mes',           label: 'Mês',          desc: 'Distribuição ao longo do tempo' },
  { value: 'grupo_50_30_20',label: 'Grupo 50/30/20',desc: 'Essencial, Desejável, Poupança' },
]

export const CHART_TYPE_OPTIONS: { value: ChartType; label: string; desc: string; icon: string }[] = [
  { value: 'bar',            label: 'Barras',    desc: 'Comparar categorias lado a lado',      icon: '📊' },
  { value: 'bar_horizontal', label: 'Barras H.', desc: 'Ranking horizontal de categorias',     icon: '📉' },
  { value: 'pie',            label: 'Pizza',     desc: 'Proporção entre categorias',           icon: '🥧' },
  { value: 'donut',          label: 'Rosca',     desc: 'Proporção com destaque no centro',     icon: '🍩' },
  { value: 'line',           label: 'Linha',     desc: 'Tendência ao longo do tempo',          icon: '📈' },
  { value: 'area',           label: 'Área',      desc: 'Volume ao longo do tempo',             icon: '🏔️' },
  { value: 'number',         label: 'Número',    desc: 'Exibir um único valor grande',         icon: '#' },
]

export const QUICK_SUGGESTIONS: (Partial<WidgetConfig> & { titulo: string })[] = [
  { titulo: 'Despesas por Categoria',     agruparPor: 'categoria',    medida: 'valor', tipoGrafico: 'bar_horizontal', periodo: 'mes_atual',             filtroTipo: 'Despesa', topN: 10, cor: '#ef4444' },
  { titulo: 'Receitas vs Despesas',       agruparPor: 'tipo',         medida: 'valor', tipoGrafico: 'bar',            periodo: 'ultimos_6_meses',       filtroTipo: 'Todos',   topN: 10, cor: '#10b981' },
  { titulo: 'Gastos: Mês vs Anterior',    agruparPor: 'categoria',    medida: 'valor', tipoGrafico: 'bar',            periodo: 'mes_atual_vs_anterior', filtroTipo: 'Despesa', topN: 8,  cor: '#8b5cf6' },
  { titulo: 'Distribuição 50/30/20',      agruparPor: 'grupo_50_30_20', medida: 'valor', tipoGrafico: 'donut',        periodo: 'mes_atual',             filtroTipo: 'Despesa', topN: 5,  cor: '#f59e0b' },
]
