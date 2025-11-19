'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contasAPI, lancamentosAPI, metasAPI, Conta, Meta } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function DashboardPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [totais, setTotais] = useState({ total_receitas: '0', total_despesas: '0', saldo: '0' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar contas com saldo
      const contasResponse = await contasAPI.listarComSaldo()
      setContas(contasResponse.data)

      // Carregar metas ativas
      const metasResponse = await metasAPI.listar('Em Andamento')
      setMetas(metasResponse.data)

      // Carregar totais do mês atual
      const hoje = new Date()
      const inicio = format(startOfMonth(hoje), 'yyyy-MM-dd')
      const fim = format(endOfMonth(hoje), 'yyyy-MM-dd')
      
      const totaisResponse = await lancamentosAPI.obterTotais(inicio, fim)
      setTotais(totaisResponse.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const saldoTotal = contas.reduce((acc, conta) => {
    return acc + parseFloat(conta.saldo_atual || conta.saldo_inicial)
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Total</CardTitle>
            <Wallet className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(saldoTotal)}</div>
            <p className="text-xs text-gray-600 mt-1">{contas.length} contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receitas do Mês</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(parseFloat(totais.total_receitas))}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Entradas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas do Mês</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(parseFloat(totais.total_despesas))}
            </div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Saídas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo do Mês</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(totais.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(parseFloat(totais.saldo))}
            </div>
            <p className="text-xs text-gray-600 mt-1">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Contas e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            {contas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma conta cadastrada</p>
            ) : (
              <div className="space-y-3">
                {contas.slice(0, 5).map((conta) => (
                  <div key={conta.id_conta} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: conta.cor || '#3B82F6' }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{conta.nome}</p>
                        <p className="text-xs text-gray-500">{conta.tipo}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(conta.saldo_atual || conta.saldo_inicial))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas */}
        <Card>
          <CardHeader>
            <CardTitle>Metas em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            {metas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma meta em andamento</p>
            ) : (
              <div className="space-y-4">
                {metas.slice(0, 5).map((meta) => (
                  <div key={meta.id_meta} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{meta.nome}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(parseFloat(meta.valor_atual || '0'))} de {formatCurrency(parseFloat(meta.valor_alvo))}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {meta.percentual_atingido?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(meta.percentual_atingido || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

