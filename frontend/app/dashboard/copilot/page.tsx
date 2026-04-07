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
  { icon: BarChart3, label: 'Em que gastei mais este mês?', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { icon: Target, label: 'Como atingir minhas metas mais rápido?', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { icon: PiggyBank, label: 'Crie um plano de economia para mim', color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { icon: Lightbulb, label: 'Dicas para reduzir gastos fixos', color: 'text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100' },
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
      const errMsg = err.response?.data?.detail || 'Erro ao conectar com o Copilot. Verifique se a API de IA está configurada.'
      setError(errMsg)
      // Add error as assistant message
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: `⚠️ ${errMsg}\n\nPara configurar o Copilot, adicione sua chave da API do Google Gemini no arquivo \`.env\` do backend:\n\`GEMINI_API_KEY=sua_chave_aqui\``,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            Copilot IA
          </h1>
          <p className="text-gray-500 mt-1">Seu assistente financeiro inteligente</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-200">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-700">Powered by Gemini</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
              <div className="space-y-3">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Como posso ajudar?</h3>
                <p className="text-gray-500 max-w-md">
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pensando...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre suas finanças..."
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-11 px-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
