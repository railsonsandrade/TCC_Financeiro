'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { EvolucaoSaldo } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 shadow-xl min-w-[160px] border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }} className="text-xs font-medium capitalize">{entry.name === 'receitas' ? 'Receitas' : 'Despesas'}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(entry.value)}</span>
          </div>
        ))}
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Saldo</span>
            <span className={`text-xs font-bold ${(payload[0]?.value || 0) - (payload[1]?.value || 0) >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0))}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

interface AreaChartEvolucaoProps {
  dados: EvolucaoSaldo[]
}

export default function AreaChartEvolucao({ dados }: AreaChartEvolucaoProps) {
  const formatMes = (mes: string) => {
    try {
      const [year, month] = mes.split('-')
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return `${nomes[parseInt(month) - 1]}/${year.slice(2)}`
    } catch { return mes }
  }

  const dadoFormatado = dados.map(d => ({
    ...d,
    mes: formatMes(d.mes_ano),
    receitas: parseFloat(String(d.receitas || 0)),
    despesas: parseFloat(String(d.despesas || 0)),
  }))

  if (dadoFormatado.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dadoFormatado} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="mes"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend
            formatter={(value) => (
              <span className="text-xs capitalize" style={{ color: 'var(--foreground)' }}>
                {value === 'receitas' ? 'Receitas' : 'Despesas'}
              </span>
            )}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="receitas"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorReceitas)"
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#10b981' }}
          />
          <Area
            type="monotone"
            dataKey="despesas"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorDespesas)"
            dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
