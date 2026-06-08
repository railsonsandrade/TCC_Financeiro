'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  PieChart, Pie, LineChart, Line, AreaChart, Area, ResponsiveContainer
} from 'recharts'
import { lancamentosAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  WidgetConfig, CHART_COLORS_PALETTE, buildChartData, buildComparisonData, getPeriodoDates
} from '@/lib/dashboardHelpers'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// ─── Shared Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      className="rounded-xl p-3 shadow-xl min-w-[140px] border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {label && <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: entry.color || entry.fill }} className="text-xs font-medium">{entry.name || entry.dataKey}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
            {isCurrency ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Number Widget ────────────────────────────────────────────────────────────

function NumberDisplay({ valor, isCurrency }: { valor: number; isCurrency: boolean }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-black" style={{ color: 'var(--foreground)' }}>
          {isCurrency ? formatCurrency(valor) : valor.toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CustomChartWidgetProps {
  config: WidgetConfig
  globalFilter?: {
    tipo: 'mes' | 'periodo'
    mes: Date
    data_inicio: string
    data_fim: string
  }
}

export default function CustomChartWidget({ config, globalFilter }: CustomChartWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [labelA, setLabelA] = useState('')
  const [labelB, setLabelB] = useState('')
  const isComparison = config.periodo === 'mes_atual_vs_anterior'
  const isCurrency = config.medida === 'valor'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const base = globalFilter?.mes || new Date()

        // If custom global range, override the widget's config time range
        const overrideRange = globalFilter?.tipo === 'periodo'

        if (isComparison) {
          let reqA_inicio, reqA_fim, reqB_inicio, reqB_fim
          let la, lb

          if (overrideRange) {
            const startA = new Date(globalFilter!.data_inicio + 'T00:00:00')
            const endA = new Date(globalFilter!.data_fim + 'T00:00:00')
            reqA_inicio = globalFilter!.data_inicio
            reqA_fim = globalFilter!.data_fim
            reqB_inicio = format(subMonths(startA, 1), 'yyyy-MM-dd')
            reqB_fim = format(subMonths(endA, 1), 'yyyy-MM-dd')
            la = 'Período Atual'
            lb = 'Período Anterior'
          } else {
            reqA_inicio = format(startOfMonth(base), 'yyyy-MM-dd')
            reqA_fim = format(endOfMonth(base), 'yyyy-MM-dd')
            reqB_inicio = format(startOfMonth(subMonths(base, 1)), 'yyyy-MM-dd')
            reqB_fim = format(endOfMonth(subMonths(base, 1)), 'yyyy-MM-dd')
            la = format(base, 'MM/yy')
            lb = format(subMonths(base, 1), 'MM/yy')
          }

          setLabelA(la)
          setLabelB(lb)

          const [respA, respB] = await Promise.all([
            lancamentosAPI.listarComDetalhes({
              data_inicio: reqA_inicio,
              data_fim: reqA_fim,
            }),
            lancamentosAPI.listarComDetalhes({
              data_inicio: reqB_inicio,
              data_fim: reqB_fim,
            }),
          ])
          const data = buildComparisonData(respA.data, respB.data, config, la, lb)
          setChartData(data)
        } else {
          let inicio, fim;
          if (overrideRange) {
             inicio = globalFilter!.data_inicio;
             fim = globalFilter!.data_fim;
          } else {
             const periodDates = getPeriodoDates(config.periodo, base)
             inicio = periodDates.inicio
             fim = periodDates.fim
          }
          
          const resp = await lancamentosAPI.listarComDetalhes({ data_inicio: inicio, data_fim: fim })
          setChartData(buildChartData(resp.data, config))
        }
      } catch (e) {
        console.error('CustomChartWidget error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [config, globalFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  const totalSum = isComparison
    ? 0
    : chartData.reduce((s, d) => s + (d.valor || 0), 0)

  // number widget
  if (config.tipoGrafico === 'number') {
    return <NumberDisplay valor={totalSum} isCurrency={isCurrency} />
  }

  const tickStyle = { fill: 'var(--muted-foreground)', fontSize: 11 }
  const gridStroke = 'var(--border)'

  // ── BAR (vertical) ──
  if (config.tipoGrafico === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="nome" tick={tickStyle} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis tickFormatter={isCurrency ? v => `R$${(v/1000).toFixed(0)}k` : undefined} tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          {isComparison ? (
            <>
              <Legend formatter={v => <span className="text-xs" style={{ color: 'var(--foreground)' }}>{v}</span>} iconType="circle" iconSize={8} />
              <Bar dataKey={labelA} fill={config.cor} radius={[4,4,0,0]} maxBarSize={32} />
              <Bar dataKey={labelB} fill={CHART_COLORS_PALETTE[3]} radius={[4,4,0,0]} maxBarSize={32} />
            </>
          ) : (
            <Bar dataKey="valor" radius={[4,4,0,0]} maxBarSize={28}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS_PALETTE[i % CHART_COLORS_PALETTE.length]} />)}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // ── BAR HORIZONTAL ──
  if (config.tipoGrafico === 'bar_horizontal') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" tickFormatter={isCurrency ? v => `R$${(v/1000).toFixed(1)}k` : undefined} tick={tickStyle} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis type="category" dataKey="nome" tick={tickStyle} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          <Bar dataKey="valor" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS_PALETTE[i % CHART_COLORS_PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // ── PIE ──
  if (config.tipoGrafico === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius="75%" label={({ name, percent }: any) => `${((percent || 0)*100).toFixed(0)}%`} labelLine={false} stroke="var(--card)">
            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS_PALETTE[i % CHART_COLORS_PALETTE.length]} strokeWidth={2} />)}
          </Pie>
          <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
          <Legend formatter={v => <span className="text-xs" style={{ color: 'var(--foreground)' }}>{v}</span>} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // ── DONUT ──
  if (config.tipoGrafico === 'donut') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius="75%" innerRadius="42%" stroke="var(--card)">
            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS_PALETTE[i % CHART_COLORS_PALETTE.length]} strokeWidth={2} />)}
          </Pie>
          <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
          <Legend formatter={v => <span className="text-xs" style={{ color: 'var(--foreground)' }}>{v}</span>} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // ── LINE ──
  if (config.tipoGrafico === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="nome" tick={tickStyle} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis tickFormatter={isCurrency ? v => `R$${(v/1000).toFixed(0)}k` : undefined} tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="valor" stroke={config.cor} strokeWidth={2} dot={{ r: 3, fill: config.cor, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // ── AREA ──
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`grad-${config.cor.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.cor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={config.cor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="nome" tick={tickStyle} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
        <YAxis tickFormatter={isCurrency ? v => `R$${(v/1000).toFixed(0)}k` : undefined} tick={tickStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey="valor" stroke={config.cor} strokeWidth={2} fill={`url(#grad-${config.cor.replace('#','')})`} dot={{ r: 3, fill: config.cor, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
