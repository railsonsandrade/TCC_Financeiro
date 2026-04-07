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
      <div className="bg-[#1a202c] border border-[#2a3140] rounded-xl p-3 shadow-xl">
        <p className="text-gray-300 font-semibold text-sm mb-1">{label}</p>
        <p className="text-white font-bold">{formatCurrency(payload[0].value)}</p>
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
      <div className="flex items-center justify-center h-full text-gray-500">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#2a3140' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
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
