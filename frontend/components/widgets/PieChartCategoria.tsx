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
      <div className="bg-[#1a202c] border border-[#2a3140] rounded-xl p-3 shadow-xl">
        <p className="text-gray-300 font-semibold text-sm">{payload[0].name}</p>
        <p className="text-white font-bold">{formatCurrency(payload[0].value)}</p>
        <p className="text-gray-400 text-xs">{payload[0].payload.percent?.toFixed(1)}%</p>
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
      <div className="flex items-center justify-center h-full text-gray-500">
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
          >
            {comPercent.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
