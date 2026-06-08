'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { GastosPorCategoria } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 shadow-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <p className="font-semibold text-sm" style={{ color: 'var(--muted-foreground)' }}>{payload[0].name}</p>
        <p className="font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(payload[0].value)}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{payload[0].payload.percent?.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface PieChartCategoriaProps {
  dados: GastosPorCategoria[]
  tipo?: 'Receita' | 'Despesa' | 'Todos'
}

export default function PieChartCategoria({ dados, tipo = 'Despesa' }: PieChartCategoriaProps) {
  const filtrados = tipo === 'Todos' ? dados : dados.filter(d => d.tipo_categoria === tipo)
  const total = filtrados.reduce((acc, d) => acc + d.valor, 0)
  const comPercent = filtrados.map(d => ({ ...d, percent: (d.valor / total) * 100 }))

  if (comPercent.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">🥧</div>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={comPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius="75%"
            innerRadius="40%"
            dataKey="valor"
            nameKey="categoria"
            stroke="var(--card)"
          >
            {comPercent.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-xs" style={{ color: 'var(--foreground)' }}>{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
