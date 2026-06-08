'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'
import { GastosPorCategoria } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

interface BarChartCategoriaProps {
  dados: GastosPorCategoria[]
  titulo?: string
  tipo?: 'Receita' | 'Despesa' | 'Todos'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 shadow-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function BarChartCategoria({ dados, titulo = 'Gastos por Categoria', tipo = 'Despesa' }: BarChartCategoriaProps) {
  const filtrados = tipo === 'Todos' ? dados : dados.filter(d => d.tipo_categoria === tipo)
  const sorted = [...filtrados].sort((a, b) => b.valor - a.valor)

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          <Bar dataKey="valor" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {sorted.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
