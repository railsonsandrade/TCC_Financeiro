'use client'

import { Wallet, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CardResumoProps {
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  saldoMes: number
}

export default function CardResumo({ saldoTotal, totalReceitas, totalDespesas, saldoMes }: CardResumoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Saldo Total */}
      <div
        className="flex flex-col justify-between p-4 rounded-xl border"
        style={{ background: 'var(--blue-gradient-bg, rgba(59, 130, 246, 0.1))', borderColor: 'var(--blue-gradient-border, rgba(59, 130, 246, 0.2))' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">Saldo Total</span>
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <Wallet className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>{formatCurrency(saldoTotal)}</div>
          <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Todas as contas</div>
        </div>
      </div>

      {/* Receitas */}
      <div
        className="flex flex-col justify-between p-4 rounded-xl border"
        style={{ background: 'var(--emerald-gradient-bg, rgba(16, 185, 129, 0.1))', borderColor: 'var(--emerald-gradient-border, rgba(16, 185, 129, 0.2))' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Receitas</span>
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>{formatCurrency(totalReceitas)}</div>
          <div className="flex items-center text-xs text-emerald-500 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> Entradas do mês
          </div>
        </div>
      </div>

      {/* Despesas */}
      <div
        className="flex flex-col justify-between p-4 rounded-xl border"
        style={{ background: 'var(--red-gradient-bg, rgba(239, 68, 68, 0.1))', borderColor: 'var(--red-gradient-border, rgba(239, 68, 68, 0.2))' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">Despesas</span>
          <div className="p-1.5 bg-red-500/10 rounded-lg">
            <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>{formatCurrency(totalDespesas)}</div>
          <div className="flex items-center text-xs text-red-500 dark:text-red-400 mt-1">
            <ArrowDownRight className="w-3 h-3 mr-1" /> Saídas do mês
          </div>
        </div>
      </div>

      {/* Saldo do Mês */}
      <div
        className="flex flex-col justify-between p-4 rounded-xl border"
        style={{
          background: saldoMes >= 0 ? 'var(--yellow-gradient-bg, rgba(234, 179, 8, 0.1))' : 'var(--orange-gradient-bg, rgba(249, 115, 22, 0.1))',
          borderColor: saldoMes >= 0 ? 'var(--yellow-gradient-border, rgba(234, 179, 8, 0.2))' : 'var(--orange-gradient-border, rgba(249, 115, 22, 0.2))'
        }}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${saldoMes >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-500 dark:text-orange-400'}`}>Saldo Mês</span>
          <div className={`p-1.5 rounded-lg ${saldoMes >= 0 ? 'bg-yellow-500/10' : 'bg-orange-500/10'}`}>
            <Target className={`w-4 h-4 ${saldoMes >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-500 dark:text-orange-400'}`} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>{formatCurrency(saldoMes)}</div>
          <div className={`text-xs mt-1 ${saldoMes >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {saldoMes >= 0 ? '✓ Positivo' : '⚠ Negativo'}
          </div>
        </div>
      </div>
    </div>
  )
}
