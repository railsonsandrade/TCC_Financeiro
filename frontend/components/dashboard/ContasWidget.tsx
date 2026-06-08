'use client'

import { Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Conta } from '@/lib/api'

interface ContasWidgetProps {
  contas: Conta[]
}

export default function ContasWidget({ contas }: ContasWidgetProps) {
  if (contas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <div className="text-center">
          <Wallet className="w-10 h-10 mx-auto mb-2 opacity-60" />
          <p className="text-sm">Nenhuma conta cadastrada</p>
        </div>
      </div>
    )
  }

  const total = contas.reduce((acc, c) => acc + parseFloat(String(c.saldo_atual ?? c.saldo_inicial ?? 0)), 0)

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between mb-3 pb-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total em contas</span>
        <span className="text-sm font-bold text-blue-500">{formatCurrency(total)}</span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1">
        {contas.map((conta) => {
          const saldo = parseFloat(String(conta.saldo_atual ?? conta.saldo_inicial ?? 0))
          const cor = '#3b82f6'
          return (
            <div
              key={conta.id_conta}
              className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:border-blue-500"
              style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{conta.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{conta.tipo}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${saldo >= 0 ? '' : 'text-red-500'}`} style={saldo >= 0 ? { color: 'var(--foreground)' } : {}}>
                {formatCurrency(saldo)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
