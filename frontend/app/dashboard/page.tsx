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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-50">Dashboard</h1>
          <p className="text-gray-400 mt-2 text-base md:text-lg">Visão geral das suas finanças</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-gray-500 mb-1">Período</p>
          <div className="flex items-center space-x-3">
            <button onClick={prevMonth} className="p-1.5 bg-[#1a202c] text-gray-400 rounded-lg border border-[#222834] hover:bg-[#222834] hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <p className="text-lg font-semibold text-gray-100 min-w-[140px] text-center capitalize">
              {format(periodo, 'MMMM yyyy', { locale: ptBR })}
            </p>
            <button onClick={nextMonth} className="p-1.5 bg-[#1a202c] text-gray-400 rounded-lg border border-[#222834] hover:bg-[#222834] hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo - Design Moderno Escuro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Total */}
        <Card className="bg-[#12161f] border-[#222834] shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-[#3b82f6]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#222834]">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Saldo Total</CardTitle>
            <div className="p-2 bg-[#3b82f6]/10 rounded-lg border border-[#3b82f6]/20">
              <Wallet className="w-5 h-5 text-[#3b82f6]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-50">{formatCurrency(saldoTotal)}</div>
            <p className="text-xs text-[#3b82f6] mt-2 font-medium">{contas.length} contas ativas</p>
          </CardContent>
        </Card>

        {/* Receitas do Mês */}
        <Card className="bg-[#12161f] border-[#222834] shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-[#10b981]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#222834]">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Receitas</CardTitle>
            <div className="p-2 bg-[#10b981]/10 rounded-lg border border-[#10b981]/20">
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-50">
              {formatCurrency(parseFloat(totais.total_receitas))}
            </div>
            <div className="flex items-center text-xs text-[#10b981] mt-2 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Entradas do período
            </div>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="bg-[#12161f] border-[#222834] shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-[#ef4444]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#222834]">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Despesas</CardTitle>
            <div className="p-2 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20">
              <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-50">
              {formatCurrency(parseFloat(totais.total_despesas))}
            </div>
            <div className="flex items-center text-xs text-[#ef4444] mt-2 font-medium">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              Saídas do período
            </div>
          </CardContent>
        </Card>

        {/* Saldo do Mês */}
        <Card className={`bg-[#12161f] border-[#222834] shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${parseFloat(totais.saldo) >= 0 ? 'border-l-[#eab308]' : 'border-l-[#f97316]'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#222834]">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Saldo Mês</CardTitle>
            <div className={`p-2 rounded-lg border ${parseFloat(totais.saldo) >= 0 ? 'bg-[#eab308]/10 border-[#eab308]/20' : 'bg-[#f97316]/10 border-[#f97316]/20'}`}>
              <Target className={`w-5 h-5 ${parseFloat(totais.saldo) >= 0 ? 'text-[#eab308]' : 'text-[#f97316]'}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-50">
              {formatCurrency(parseFloat(totais.saldo))}
            </div>
            <p className={`text-xs mt-2 font-medium ${parseFloat(totais.saldo) >= 0 ? 'text-[#eab308]' : 'text-[#f97316]'}`}>
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contas e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas */}
        <Card className="bg-[#12161f] border-[#222834] shadow-lg border-t-2 border-t-[#3b82f6]">
          <CardHeader className="border-b border-[#222834] bg-[#151a22]">
            <CardTitle className="text-lg font-bold text-gray-100 flex items-center">
              <Wallet className="w-5 h-5 mr-3 text-[#3b82f6]" />
              Minhas Contas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {contas.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma conta cadastrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contas.slice(0, 5).map((conta) => (
                  <div key={conta.id_conta} className="flex items-center justify-between p-4 bg-[#1a202c] rounded-xl border border-[#2a3140] hover:border-[#3e485e] transition-colors">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-3 h-10 rounded-full shadow-sm"
                        style={{ backgroundColor: conta.cor || '#3b82f6' }}
                      />
                      <div>
                        <p className="font-semibold text-gray-200">{conta.nome}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{conta.tipo}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg text-gray-100">
                      {formatCurrency(parseFloat(conta.saldo_atual || conta.saldo_inicial))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="bg-[#12161f] border-[#222834] shadow-lg border-t-2 border-t-[#eab308]">
          <CardHeader className="border-b border-[#222834] bg-[#151a22]">
            <CardTitle className="text-lg font-bold text-gray-100 flex items-center">
              <Target className="w-5 h-5 mr-3 text-[#eab308]" />
              Metas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {metas.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma meta em andamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metas.slice(0, 5).map((meta) => (
                  <div key={meta.id_meta} className="space-y-3 p-4 bg-[#1a202c] rounded-xl border border-[#2a3140] hover:border-[#3e485e] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-200">{meta.nome}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <span className="text-gray-300">{formatCurrency(parseFloat(meta.valor_atual || '0'))}</span> de {formatCurrency(parseFloat(meta.valor_alvo))}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/20 px-2 py-1 rounded-md">
                        {meta.percentual_atingido?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-[#12161f] rounded-full h-2 overflow-hidden border border-[#222834]">
                      <div
                        className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
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

