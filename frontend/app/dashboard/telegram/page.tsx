'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Bot, RefreshCw, CheckCircle, Smartphone } from 'lucide-react'

export default function TelegramPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/v1/telegram/status')
      setStatus(res.data)
    } catch (error) {
      console.error('Erro ao buscar status', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const gerarCodigo = async () => {
    setGerando(true)
    try {
      const res = await api.post('/api/v1/telegram/gerar-codigo')
      setStatus((prev: any) => ({ ...prev, codigo: res.data.codigo }))
    } catch (error) {
      console.error('Erro ao gerar código', error)
      alert('Erro ao gerar código.')
    } finally {
      setGerando(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Smartphone className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Integração com Telegram</h1>
          <p className="text-gray-400">Acesse a PatarIA e registre gastos direto pelo seu celular.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
        {!status?.bot_configurado ? (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Bot não configurado</h2>
            <p className="text-gray-400">O administrador do sistema não configurou o TELEGRAM_BOT_TOKEN no servidor.</p>
          </div>
        ) : status.vinculado ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-green-400">Conta Vinculada!</h2>
            <p className="text-gray-300">
              Seu Telegram (@{status.username || 'usuario'}) já está conectado.
            </p>
            <p className="text-gray-400 mt-4 text-sm">
              Abra o bot no Telegram e use comandos como /saldo, /extrato ou /copilot.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vincule seu Telegram</h2>
            <p className="text-gray-300 mb-6">
              Para registrar gastos rápido e conversar com a PatarIA, gere um código abaixo.
            </p>
            
            {status.codigo ? (
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-lg border border-yellow-500/30 inline-block">
                  <p className="text-sm text-gray-400 mb-1">Seu código (válido temporariamente)</p>
                  <p className="text-3xl font-mono text-yellow-400 font-bold tracking-widest">{status.codigo}</p>
                </div>
                <div className="text-left bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-6">
                  <h3 className="font-semibold text-blue-400 mb-2">O que fazer agora?</h3>
                  <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                    <li>Abra o Telegram e busque pelo nosso bot.</li>
                    <li>Inicie uma conversa (clique em Iniciar ou envie <code className="bg-black/50 px-1 py-0.5 rounded">/start</code>).</li>
                    <li>Envie exatamente a mensagem: <code className="bg-black/50 px-1 py-0.5 rounded text-yellow-400">/vincular {status.codigo}</code></li>
                    <li>Volte aqui e atualize a página!</li>
                  </ol>
                </div>
                <button
                  onClick={fetchStatus}
                  className="mt-4 flex items-center justify-center space-x-2 w-full py-3 bg-[var(--card-bg)] hover:bg-gray-800 border border-[var(--card-border)] rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Já vinculei, atualizar status</span>
                </button>
              </div>
            ) : (
              <button
                onClick={gerarCodigo}
                disabled={gerando}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {gerando ? 'Gerando...' : 'Gerar Código de Vinculação'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
