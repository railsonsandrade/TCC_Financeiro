'use client'

import { useState } from 'react'
import { X, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  WidgetConfig, AgruparPor, Medida, ChartType, Periodo,
  AGRUPAR_OPTIONS, CHART_TYPE_OPTIONS, PERIOD_OPTIONS, QUICK_SUGGESTIONS, CHART_COLORS_PALETTE,
} from '@/lib/dashboardHelpers'

interface ModalCriarWidgetProps {
  onClose: () => void
  onSave: (config: WidgetConfig) => void
  initialConfig?: Partial<WidgetConfig>
}

const DEFAULT_CONFIG: WidgetConfig = {
  titulo: '',
  agruparPor: 'categoria',
  medida: 'valor',
  tipoGrafico: 'bar',
  periodo: 'mes_atual',
  filtroTipo: 'Despesa',
  topN: 10,
  cor: '#3b82f6',
}

export default function ModalCriarWidget({ onClose, onSave, initialConfig }: ModalCriarWidgetProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<WidgetConfig>({ ...DEFAULT_CONFIG, ...initialConfig })

  const totalSteps = 5
  const canNext = () => {
    if (step === 1) return config.titulo.trim().length > 0
    return true
  }

  const applyQuickSuggestion = (sug: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...sug }))
    setStep(5) // pular para detalhes finais
  }

  const handleSave = () => {
    if (config.titulo.trim()) onSave(config)
  }

  const update = <K extends keyof WidgetConfig>(key: K, val: WidgetConfig[K]) =>
    setConfig(prev => ({ ...prev, [key]: val }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              {initialConfig?.titulo ? 'Editar Widget' : 'Criar Widget Personalizado'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Crie um gráfico personalizado para o seu dashboard
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 flex-shrink-0" style={{ background: 'var(--card)' }}>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-blue-500' : 'opacity-20'
                }`}
                style={i >= step ? { background: 'var(--muted-foreground)' } : {}}
              />
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>Etapa {step} de {totalSteps}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" style={{ background: 'var(--card)' }}>

          {/* ── Quick Suggestions (visible only on step 1) ── */}
          {step === 1 && (
            <div
              className="p-3 rounded-xl"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Sugestões rápidas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.titulo}
                    onClick={() => applyQuickSuggestion(sug)}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:text-blue-500 hover:border-blue-500"
                    style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                  >
                    {sug.titulo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: Nome ── */}
          {step === 1 && (
            <div>
              <StepHeader num={1} title="Nome do widget" desc="Um título curto que aparecerá no topo do gráfico." />
              <input
                autoFocus
                type="text"
                value={config.titulo}
                onChange={e => update('titulo', e.target.value)}
                placeholder="Ex: Gastos com Alimentação, Receitas vs Despesas..."
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          )}

          {/* ── STEP 2: Agrupar Por ── */}
          {step === 2 && (
            <div>
              <StepHeader num={2} title="Agrupar por qual informação?" desc="Define como os dados serão separados no gráfico." />
              <div className="grid grid-cols-2 gap-2">
                {AGRUPAR_OPTIONS.map(opt => (
                  <SelectCard
                    key={opt.value}
                    selected={config.agruparPor === opt.value}
                    onClick={() => update('agruparPor', opt.value)}
                    title={opt.label}
                    desc={opt.desc}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Medida ── */}
          {step === 3 && (
            <div>
              <StepHeader num={3} title="O que deseja medir?" desc="Escolha se quer contar a quantidade ou somar os valores em reais." />
              <div className="grid grid-cols-2 gap-3">
                <SelectCard
                  selected={config.medida === 'valor'}
                  onClick={() => update('medida', 'valor')}
                  title="Valor em R$"
                  desc="Somar os valores dos lançamentos"
                  example="Ex: R$ 1.200, R$ 450..."
                />
                <SelectCard
                  selected={config.medida === 'quantidade'}
                  onClick={() => update('medida', 'quantidade')}
                  title="Quantidade"
                  desc="Contar quantos lançamentos existem"
                  example="Ex: 15 lançamentos, 8..."
                />
              </div>

              <div className="mt-4">
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Filtrar por tipo</p>
                <div className="flex gap-2">
                  {(['Despesa', 'Receita', 'Todos'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => update('filtroTipo', t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        config.filtroTipo === t
                          ? 'bg-blue-500/20 border-blue-500 text-blue-500 dark:text-blue-400'
                          : 'hover:opacity-80'
                      }`}
                      style={config.filtroTipo !== t ? { background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Tipo de Gráfico ── */}
          {step === 4 && (
            <div>
              <StepHeader num={4} title="Tipo de gráfico" desc="Escolha a melhor forma de visualizar. Barras e pizza são ótimos para comparar, linha para ver tendências." />
              <div className="grid grid-cols-3 gap-2">
                {CHART_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update('tipoGrafico', opt.value)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-colors ${
                      config.tipoGrafico === opt.value
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'hover:opacity-80'
                    }`}
                    style={config.tipoGrafico !== opt.value ? { background: 'var(--input)', borderColor: 'var(--border)' } : {}}
                  >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className={`text-xs font-semibold ${config.tipoGrafico === opt.value ? 'text-blue-500 dark:text-blue-400' : ''}`} style={config.tipoGrafico !== opt.value ? { color: 'var(--muted-foreground)' } : {}}>{opt.label}</span>
                    <span className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--muted-foreground)', opacity: 0.8 }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 5: Detalhes Finais ── */}
          {step === 5 && (
            <div className="space-y-4">
              <StepHeader num={5} title="Detalhes finais" desc="Período, cor principal e quantidade de resultados." />

              {/* Período */}
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Período</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {PERIOD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('periodo', opt.value)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        config.periodo === opt.value
                          ? 'bg-blue-500/20 border-blue-500 text-blue-500 dark:text-blue-400'
                          : 'hover:opacity-80'
                      }`}
                      style={config.periodo !== opt.value ? { background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
                    >
                      {opt.label}
                      {config.periodo === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top N */}
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Quantos resultados exibir</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => update('topN', n)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        config.topN === n
                          ? 'bg-blue-500/20 border-blue-500 text-blue-500 dark:text-blue-400'
                          : 'hover:opacity-80'
                      }`}
                      style={config.topN !== n ? { background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' } : {}}
                    >
                      Top {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Cor do gráfico</p>
                <div className="flex flex-wrap gap-2">
                  {CHART_COLORS_PALETTE.slice(0, 10).map(cor => (
                    <button
                      key={cor}
                      onClick={() => update('cor', cor)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 shadow-sm ${
                        config.cor === cor ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--muted)' }}
        >
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-black/5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 1 ? 'Voltar' : 'Cancelar'}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                canNext()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!config.titulo.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialConfig?.titulo ? 'Salvar Alterações' : 'Criar Widget'} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{title}</span>
      </div>
      <p className="text-xs ml-8" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
    </div>
  )
}

function SelectCard({
  selected, onClick, title, desc, example,
}: {
  selected: boolean; onClick: () => void; title: string; desc: string; example?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-colors w-full ${
        selected
          ? 'bg-blue-500/20 border-blue-500'
          : 'hover:opacity-80'
      }`}
      style={!selected ? { background: 'var(--input)', borderColor: 'var(--border)' } : {}}
    >
      <span className={`text-sm font-semibold ${selected ? 'text-blue-500 dark:text-blue-400' : ''}`} style={!selected ? { color: 'var(--foreground)' } : {}}>{title}</span>
      <span className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--muted-foreground)' }}>{desc}</span>
      {example && <span className="text-[10px] mt-1 italic" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{example}</span>}
    </button>
  )
}
