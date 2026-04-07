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
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm">Nenhuma conta cadastrada</p>
        </div>
      </div>
    )
  }

  const total = contas.reduce((acc, c) => acc + parseFloat(String(c.saldo_atual ?? c.saldo_inicial ?? 0)), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#222834]">
        <span className="text-xs text-gray-500">Total em contas</span>
        <span className="text-sm font-bold text-blue-400">{formatCurrency(total)}</span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1">
        {contas.map((conta) => {
          const saldo = parseFloat(String(conta.saldo_atual ?? conta.saldo_inicial ?? 0))
          const cor = '#3b82f6'
          return (
            <div
              key={conta.id_conta}
              className="flex items-center justify-between p-3 bg-[#1a202c] rounded-xl border border-[#2a3140] hover:border-[#3e485e] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
                <div>
                  <p className="font-semibold text-gray-200 text-sm">{conta.nome}</p>
                  <p className="text-xs text-gray-500">{conta.tipo}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${saldo >= 0 ? 'text-gray-100' : 'text-red-400'}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
