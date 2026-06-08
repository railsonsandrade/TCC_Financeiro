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
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <Target className="w-10 h-10 mx-auto mb-2 opacity-60" />
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
            className="space-y-2 p-3 rounded-xl border transition-colors hover:border-blue-500"
            style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{meta.nome}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  <span style={{ color: 'var(--foreground)' }}>{formatCurrency(parseFloat(String(meta.valor_atual || '0')))}</span>
                  {' '}de {formatCurrency(parseFloat(String(meta.valor_alvo)))}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ml-2 flex-shrink-0 ${
                isNearDone
                  ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div
              className="w-full rounded-full h-1.5 overflow-hidden border"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  isNearDone
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.4)]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {meta.dias_restantes !== null && meta.dias_restantes !== undefined && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {meta.dias_restantes > 0 ? `${meta.dias_restantes} dias restantes` : 'Prazo encerrado'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
