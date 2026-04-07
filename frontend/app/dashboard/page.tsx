'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contasAPI, lancamentosAPI, metasAPI, Conta, Meta } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [totais, setTotais] = useState({ total_receitas: '0', total_despesas: '0', saldo: '0' })
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Date>(new Date())

  useEffect(() => {
    loadData()
  }, [periodo])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar contas com saldo
      const contasResponse = await contasAPI.listarComSaldo()
      setContas(contasResponse.data)

      // Carregar metas ativas
      const metasResponse = await metasAPI.listar('Em Andamento')
      console.log('Metas Response:', metasResponse.data)
      setMetas(metasResponse.data)

      // Carregar totais do mês atual usando a listagem de lançamentos
      // (calcula a partir dos lançamentos exibidos, garantindo consistência)
      const hoje = periodo
      const inicio = format(startOfMonth(hoje), 'yyyy-MM-dd')
      const fim = format(endOfMonth(hoje), 'yyyy-MM-dd')

      console.log('Buscando lançamentos do período para cálculo de totais:', { inicio, fim })
      const lancsResponse = await lancamentosAPI.listar({ data_inicio: inicio, data_fim: fim })
      const lancs = lancsResponse.data || []

      // Se não houver lançamentos retornados, tentamos buscar lançamentos recentes sem filtro
      let fallbackTotais: any | null = null
      if (lancs.length === 0) {
        try {
          // Primeiro, tentar obter totais agregados do backend
          const resp = await lancamentosAPI.obterTotais(inicio, fim)
          fallbackTotais = resp.data
          console.log('Fallback totais obtidos do endpoint /lancamentos/totais:', fallbackTotais)
        } catch (e) {
          console.warn('Fallback /lancamentos/totais falhou:', e)
        }

        // Se ainda não tivermos lançamentos, buscar lançamentos recentes sem filtro de data
        try {
          const recentResp = await lancamentosAPI.listar()
          if (recentResp.data && recentResp.data.length > 0) {
            console.log('Usando lançamentos recentes como fallback para totais:', recentResp.data.length)
            // sobrescrever lancs para prosseguir com cálculo baseado em dados reais
            // @ts-ignore
            lancs.push(...recentResp.data)
          }
        } catch (e) {
          console.warn('Busca de lançamentos recentes falhou:', e)
        }
      }


      // Somar receitas e despesas diretamente a partir dos lançamentos
      // Por padrão consideramos apenas lançamentos marcados como pagos (`pago: true`) —
      // altere `incluirNaoPagos` para `true` se quiser incluir todos os lançamentos.
      const incluirNaoPagos = false

      const filtrados = lancs.filter((l: any) => (incluirNaoPagos ? true : !!l.pago))

      const totalReceitas = filtrados
        .filter((l: any) => l.tipo === 'Receita')
        .reduce((acc: number, l: any) => acc + parseFloat(l.valor || '0'), 0)

      const totalDespesas = filtrados
        .filter((l: any) => l.tipo === 'Despesa')
        .reduce((acc: number, l: any) => acc + parseFloat(l.valor || '0'), 0)

      let total_receitas = totalReceitas
      let total_despesas = totalDespesas

      // Se não houve lançamentos mas o backend retornou totais, usamos eles
      if (lancs.length === 0 && fallbackTotais) {
        total_receitas = parseFloat(fallbackTotais.total_receitas || '0')
        total_despesas = parseFloat(fallbackTotais.total_despesas || '0')
      }

      const saldoCalculado = total_receitas - total_despesas

      console.log('Totais (final):', { total_receitas, total_despesas, saldoCalculado })

      setTotais({
        total_receitas: total_receitas.toFixed(2),
        total_despesas: total_despesas.toFixed(2),
        saldo: saldoCalculado.toFixed(2)
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const saldoTotal = contas.reduce((acc, conta) => {
    return acc + parseFloat(conta.saldo_atual || conta.saldo_inicial)
  }, 0)

  const prevMonth = () => setPeriodo((p) => addMonths(p, -1))
  const nextMonth = () => setPeriodo((p) => addMonths(p, 1))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Visão geral das suas finanças</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Período</p>
          <div className="flex items-center justify-end space-x-3">
            <button onClick={prevMonth} className="px-3 py-1 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <p className="text-lg font-semibold text-gray-900">{format(periodo, 'MMMM yyyy', { locale: ptBR })}</p>
            <button onClick={nextMonth} className="px-3 py-1 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo - Design Moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Total */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">Saldo Total</CardTitle>
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{formatCurrency(saldoTotal)}</div>
            <p className="text-xs text-blue-700 mt-2 font-medium">{contas.length} contas ativas</p>
          </CardContent>
        </Card>

        {/* Receitas do Mês */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">Receitas do Mês</CardTitle>
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {formatCurrency(parseFloat(totais.total_receitas))}
            </div>
            <div className="flex items-center text-xs text-green-700 mt-2 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Entradas do período
            </div>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-red-900">Despesas do Mês</CardTitle>
            <div className="p-2 bg-red-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {formatCurrency(parseFloat(totais.total_despesas))}
            </div>
            <div className="flex items-center text-xs text-red-700 mt-2 font-medium">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              Saídas do período
            </div>
          </CardContent>
        </Card>

        {/* Saldo do Mês */}
        <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${parseFloat(totais.saldo) >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-l-emerald-600' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-orange-600'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-semibold ${parseFloat(totais.saldo) >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>Saldo do Mês</CardTitle>
            <div className={`p-2 rounded-lg ${parseFloat(totais.saldo) >= 0 ? 'bg-emerald-600' : 'bg-orange-600'}`}>
              <Target className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${parseFloat(totais.saldo) >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
              {formatCurrency(parseFloat(totais.saldo))}
            </div>
            <p className={`text-xs mt-2 font-medium ${parseFloat(totais.saldo) >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contas e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-blue-600" />
              Minhas Contas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {contas.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma conta cadastrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contas.slice(0, 5).map((conta) => (
                  <div key={conta.id_conta} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: conta.cor || '#3B82F6' }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{conta.nome}</p>
                        <p className="text-xs text-gray-500 font-medium">{conta.tipo}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(parseFloat(conta.saldo_atual || conta.saldo_inicial))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Metas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {metas.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma meta em andamento</p>
              </div>
            ) : (
              <div className="space-y-5">
                {metas.slice(0, 5).map((meta) => (
                  <div key={meta.id_meta} className="space-y-3 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{meta.nome}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(parseFloat(meta.valor_atual || '0'))} de {formatCurrency(parseFloat(meta.valor_alvo))}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                        {meta.percentual_atingido?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
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

