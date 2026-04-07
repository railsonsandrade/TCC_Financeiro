'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { copilotAPI, CopilotMessage } from '@/lib/api'
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  Target,
  PiggyBank,
  Lightbulb,
  User,
  Loader2,
  MessageCircle,
  BarChart3,
} from 'lucide-react'

const QUICK_PROMPTS = [
  { icon: BarChart3, label: 'Em que gastei mais este mês?', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
  { icon: Target, label: 'Como atingir minhas metas mais rápido?', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/20' },
  { icon: PiggyBank, label: 'Crie um plano de economia para mim', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' },
  { icon: Lightbulb, label: 'Dicas para reduzir gastos fixos', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' },
]

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: CopilotMessage = { role: 'user', content: content.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await copilotAPI.enviarMensagem(content.trim(), updatedMessages)
      const assistantMessage: CopilotMessage = {
        role: 'assistant',
        content: response.data.resposta,
      }
      setMessages([...updatedMessages, assistantMessage])
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Erro ao conectar com a PatarIA. Verifique se a API de IA está configurada.'
      setError(errMsg)
      // Add error as assistant message
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: `⚠️ ${errMsg}\n\nPara configurar a PatarIA, adicione sua chave da API do Google Gemini no arquivo \`.env\` do backend:\n\`GEMINI_API_KEY=sua_chave_aqui\``,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-50 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            PatarIA
          </h1>
          <p className="text-gray-400 mt-1">Sua assistente financeira inteligente</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-300">Powered by Gemini</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#12161f] rounded-2xl border border-[#222834] shadow-lg overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
              <div className="space-y-3">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                  <MessageCircle className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200">Como posso ajudar?</h3>
                <p className="text-gray-400 max-w-md">
                  Pergunte sobre seus gastos, peça dicas de economia, ou solicite um plano financeiro personalizado.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {QUICK_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon
                  return (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.label)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition-all ${prompt.color}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{prompt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-yellow-500 text-black font-medium rounded-tr-sm'
                      : 'bg-[#1a202c] text-gray-200 border border-[#2a3140] rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <User className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#1a202c] border border-[#2a3140] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-violet-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pensando...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#222834] p-4 bg-[#151a22]">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre suas finanças..."
              className="flex-1 h-12 px-4 rounded-xl border border-[#2a3140] bg-[#1a202c] text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder:text-gray-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border border-violet-500/50 rounded-xl text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
