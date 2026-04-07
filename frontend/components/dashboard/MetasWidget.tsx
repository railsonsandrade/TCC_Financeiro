'use client'

import { Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Meta } from '@/lib/api'

interface MetasWidgetProps {
  metas: Meta[]
}

export default function MetasWidget({ metas }: MetasWidgetProps) {
  if (metas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Target className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm">Nenhuma meta em andamento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {metas.map((meta) => {
        const pct = Math.min(meta.percentual_atingido || 0, 100)
        const isNearDone = pct >= 80
        return (
          <div
            key={meta.id_meta}
            className="space-y-2 p-3 bg-[#1a202c] rounded-xl border border-[#2a3140] hover:border-[#3e485e] transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-200 text-sm truncate">{meta.nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="text-gray-300">{formatCurrency(parseFloat(String(meta.valor_atual || '0')))}</span>
                  {' '}de {formatCurrency(parseFloat(String(meta.valor_alvo)))}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ml-2 flex-shrink-0 ${
                isNearDone
                  ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                  : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
              }`}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-1.5 overflow-hidden border border-[#222834]">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  isNearDone
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.4)]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {meta.dias_restantes !== null && meta.dias_restantes !== undefined && (
              <p className="text-xs text-gray-500">
                {meta.dias_restantes > 0 ? `${meta.dias_restantes} dias restantes` : 'Prazo encerrado'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
