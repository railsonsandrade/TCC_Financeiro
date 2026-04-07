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
      <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Saldo Total</span>
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(saldoTotal)}</div>
          <div className="text-xs text-blue-400 mt-1">Todas as contas</div>
        </div>
      </div>

      {/* Receitas */}
      <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-700/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Receitas</span>
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(totalReceitas)}</div>
          <div className="flex items-center text-xs text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> Entradas do mês
          </div>
        </div>
      </div>

      {/* Despesas */}
      <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-700/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Despesas</span>
          <div className="p-1.5 bg-red-500/10 rounded-lg">
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(totalDespesas)}</div>
          <div className="flex items-center text-xs text-red-400 mt-1">
            <ArrowDownRight className="w-3 h-3 mr-1" /> Saídas do mês
          </div>
        </div>
      </div>

      {/* Saldo do Mês */}
      <div className={`flex flex-col justify-between p-4 rounded-xl border ${saldoMes >= 0 ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-700/30' : 'bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-700/30'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${saldoMes >= 0 ? 'text-yellow-400' : 'text-orange-400'}`}>Saldo Mês</span>
          <div className={`p-1.5 rounded-lg ${saldoMes >= 0 ? 'bg-yellow-500/10' : 'bg-orange-500/10'}`}>
            <Target className={`w-4 h-4 ${saldoMes >= 0 ? 'text-yellow-400' : 'text-orange-400'}`} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(saldoMes)}</div>
          <div className={`text-xs mt-1 ${saldoMes >= 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {saldoMes >= 0 ? '✓ Positivo' : '⚠ Negativo'}
          </div>
        </div>
      </div>
    </div>
  )
}
