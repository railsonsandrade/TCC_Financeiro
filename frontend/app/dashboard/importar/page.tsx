'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { importacaoAPI, contasAPI, Conta, ImportResult } from '@/lib/api'
import { useEffect } from 'react'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Loader2,
  CreditCard,
  Download,
  File,
  Info,
} from 'lucide-react'

export default function ImportarPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [selectedConta, setSelectedConta] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'configure' | 'result'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadContas()
  }, [])

  const loadContas = async () => {
    try {
      const response = await contasAPI.listar()
      setContas(response.data)
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.ofx'))) {
      setFile(droppedFile)
      setStep('configure')
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo CSV ou OFX')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStep('configure')
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file || !selectedConta) return

    setLoading(true)
    setError(null)

    try {
      const response = await importacaoAPI.importarNubank(file, parseInt(selectedConta))
      setResult(response.data)
      setStep('result')
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Erro ao importar arquivo. Verifique se o endpoint de importação está implementado no backend.'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setSelectedConta('')
    setResult(null)
    setError(null)
    setStep('upload')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-50 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Upload className="w-6 h-6 text-yellow-500" />
          </div>
          Importar Fatura
        </h1>
        <p className="text-gray-400 mt-1">Importe suas faturas bancárias automaticamente</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {[
          { key: 'upload', label: '1. Upload', icon: Upload },
          { key: 'configure', label: '2. Configurar', icon: CreditCard },
          { key: 'result', label: '3. Resultado', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.key
          const isPast = (step === 'configure' && i === 0) || (step === 'result' && i < 2)
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="w-4 h-4 text-gray-500" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                isPast ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30' :
                'bg-[#1a202c] text-gray-400 border border-[#2a3140]'
              }`}>
                <Icon className="w-4 h-4" />
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-sm text-[#ef4444]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao importar</p>
            <p className="mt-1 text-[#ef4444]/80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-[#ef4444]/80 hover:text-[#ef4444]" />
          </button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-[#2a3140] bg-[#12161f] hover:border-yellow-500/50 hover:bg-[#1a202c]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.ofx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1a202c] border border-[#2a3140] flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-200">
                  Arraste o arquivo CSV aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Suporte: Nubank (.csv)
                </p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 bg-[#1a202c] border border-[#2a3140] rounded-xl text-sm">
            <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-gray-300">
              <p className="font-medium text-gray-200">Como exportar sua fatura do Nubank:</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-gray-400">
                <li>Abra o app do Nubank</li>
                <li>Vá em Cartão de Crédito &gt; Faturas</li>
                <li>Selecione a fatura desejada</li>
                <li>Toque nos 3 pontinhos &gt; Exportar fatura (CSV)</li>
                <li>Importe o arquivo aqui</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && file && (
        <div className="space-y-6">
          {/* File info */}
          <div className="flex items-center gap-4 p-4 bg-[#12161f] border border-[#222834] rounded-xl">
            <div className="p-3 bg-[#10b981]/10 rounded-xl border border-[#10b981]/20">
              <File className="w-6 h-6 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-200">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={resetState}
              className="p-2 hover:bg-[#1a202c] rounded-lg transition-colors border border-transparent hover:border-[#2a3140]"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Select conta */}
          <div className="bg-[#12161f] border border-[#222834] rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Selecione a conta destino
            </h3>
            <select
              value={selectedConta}
              onChange={(e) => setSelectedConta(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#2a3140] bg-[#1a202c] px-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Selecione uma conta...</option>
              {contas.map((conta) => (
                <option key={conta.id_conta} value={conta.id_conta}>
                  {conta.nome} ({conta.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-[#3e485e] hover:bg-[#1a202c] text-gray-300" onClick={resetState}>
              Voltar
            </Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold disabled:bg-[#1a202c] disabled:text-gray-500 disabled:border-[#2a3140]"
              disabled={!selectedConta || loading}
              onClick={handleImport}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Importar Lançamentos
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <div className="space-y-6">
          <div className="bg-[#12161f] border border-[#222834] rounded-2xl p-8 text-center space-y-4 shadow-lg">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-50">Importação Concluída!</h3>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
              <div className="bg-[#10b981]/10 rounded-xl p-4 border border-[#10b981]/20">
                <p className="text-3xl font-bold text-[#10b981]">{result.total_importados}</p>
                <p className="text-sm text-[#10b981]/80 mt-1">Importados</p>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <p className="text-3xl font-bold text-yellow-500">{result.total_duplicados}</p>
                <p className="text-sm text-yellow-500/80 mt-1">Duplicados</p>
              </div>
            </div>

            {result.erros && result.erros.length > 0 && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl p-4 text-left mt-4 text-[#ef4444]">
                <p className="text-sm font-medium mb-2">Erros encontrados:</p>
                <ul className="text-sm space-y-1">
                  {result.erros.map((erro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold" onClick={resetState}>
            Importar outro arquivo
          </Button>
        </div>
      )}
    </div>
  )
}
