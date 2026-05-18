'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

import WidgetContainer from './WidgetContainer'
import MetasWidget from './MetasWidget'
import ContasWidget from './ContasWidget'
import CustomChartWidget from './CustomChartWidget'
import CardResumo from '@/components/widgets/CardResumo'
import AreaChartEvolucao from '@/components/widgets/AreaChartEvolucao'
import PieChartCategoria from '@/components/widgets/PieChartCategoria'
import BarChartCategoria from '@/components/widgets/BarChartCategoria'
import { WidgetDef, WidgetConfig } from '@/lib/dashboardHelpers'
import { Conta, Meta, GastosPorCategoria, EvolucaoSaldo } from '@/lib/api'

// Import default GridLayout dynamically to guarantee client-side only and bypass ESM/CJS issues.
// Casting as `any` is the recommended workaround when dynamic() loses prop types for complex components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GridLayout = dynamic(() => import('react-grid-layout'), { ssr: false }) as any


import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

interface DashboardGridProps {
  widgets: WidgetDef[]
  editMode: boolean
  onLayoutChange: (newLayout: any[]) => void
  onEditWidget: (widget: WidgetDef) => void
  onDeleteWidget: (id: string) => void
  contas: Conta[]
  metas: Meta[]
  gastosPorCategoria: GastosPorCategoria[]
  evolucaoSaldo: EvolucaoSaldo[]
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  saldoMes: number
  globalFilter: {
    tipo: 'mes' | 'periodo'
    mes: Date
    data_inicio: string
    data_fim: string
  }
}

export default function DashboardGrid({
  widgets,
  editMode,
  onLayoutChange,
  onEditWidget,
  onDeleteWidget,
  contas, metas, gastosPorCategoria, evolucaoSaldo,
  saldoTotal, totalReceitas, totalDespesas, saldoMes,
  globalFilter,
}: DashboardGridProps) {
  
  // Custom responsive width to bypass broken WidthProvider
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(1200)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width)
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Calculate dynamic columns based on current width (Responsive)
  const cols = width > 1200 ? 12 : width > 996 ? 10 : width > 768 ? 6 : width > 480 ? 4 : 2

  // We explicitly construct the layout array for GridLayout 
  const layout = useMemo(() => {
    return widgets.map(w => ({
      i: w.id_widget,
      x: typeof w.x === 'number' ? w.x : 0,
      y: typeof w.y === 'number' ? w.y : Infinity,
      w: typeof w.w === 'number' ? w.w : 6,
      h: typeof w.h === 'number' ? w.h : 4,
      minW: 2,
      minH: 2,
      static: !editMode // Garante a trava total fora do modo de edição
    }))
  }, [widgets, editMode])

  const renderWidgetContent = (widget: WidgetDef) => {
    switch (widget.tipo) {
      case 'card_kpi':
        return (
          <CardResumo
            saldoTotal={saldoTotal}
            totalReceitas={totalReceitas}
            totalDespesas={totalDespesas}
            saldoMes={saldoMes}
          />
        )
      case 'area_evolucao':
        return <AreaChartEvolucao dados={evolucaoSaldo} />
      case 'pie_categoria': {
        const tipo = (widget.configuracao?.filtroTipo as any) || 'Despesa'
        return <PieChartCategoria dados={gastosPorCategoria} tipo={tipo} />
      }
      case 'bar_categoria': {
        const tipo = (widget.configuracao?.filtroTipo as any) || 'Despesa'
        return <BarChartCategoria dados={gastosPorCategoria} tipo={tipo} />
      }
      case 'metas':
        return <MetasWidget metas={metas} />
      case 'contas':
        return <ContasWidget contas={contas} />
      case 'custom':
        return <CustomChartWidget config={widget.configuracao as WidgetConfig} globalFilter={globalFilter} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Widget: {widget.tipo}
          </div>
        )
    }
  }

  return (
    <div ref={containerRef} className={editMode ? 'dashboard-edit-mode' : 'dashboard-view-mode'}>
      <style>{`
        /* Modo de visualização: cursor normal, sem hover */
        .dashboard-view-mode .react-grid-item {
          cursor: default !important;
        }
        .dashboard-view-mode .react-grid-item * {
          cursor: default !important;
        }

        /* Modo de edição: feedback visual */
        .dashboard-edit-mode .react-grid-item {
          transition: box-shadow 0.2s;
          cursor: grab;
        }
        .dashboard-edit-mode .react-grid-item:hover {
          box-shadow: 0 0 0 2px #3b82f6;
          border-radius: 16px;
        }
        .dashboard-edit-mode .react-grid-item:active {
          cursor: grabbing;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.15) !important;
          border: 2px dashed rgba(59, 130, 246, 0.5) !important;
          border-radius: 16px !important;
          opacity: 1 !important;
        }
        /* Handle de resize: só visível no modo de edição */
        .dashboard-view-mode .react-resizable-handle {
          display: none !important;
        }
        .react-resizable-handle {
          bottom: 6px !important;
          right: 6px !important;
          opacity: 0.35;
        }
        .react-resizable-handle::after {
          border-color: #6b7280 !important;
          width: 8px !important;
          height: 8px !important;
        }
        .dashboard-edit-mode .react-resizable-handle {
          opacity: 0.9;
        }
      `}</style>

      <GridLayout
        layout={layout}
        width={width}
        cols={cols}
        rowHeight={60}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={(newLayout: any) => {
          // Somente propaga a mudança de layout quando estiver no modo de edição.
          // Fora do modo de edição, a lib pode reorganizar internamente — ignoramos para
          // não sobrescrever o layout salvo no banco quando o usuário troca de aba.
          if (!editMode) return
          const cleanLayout = newLayout.map((item: any) => ({
             ...item,
             x: Number.isFinite(item.x) ? item.x : 0,
             y: Number.isFinite(item.y) ? item.y : 999,
             w: Number.isFinite(item.w) ? item.w : 6,
             h: Number.isFinite(item.h) ? item.h : 4,
          }))
          onLayoutChange(cleanLayout)
        }}
        draggableHandle=".widget-drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {widgets.map((widget) => {
          // Fallback missing sizes with sensible defaults so it doesn't overlap at (0,0)
          const fallbackGrid = { 
            i: widget.id_widget, 
            x: widget.x || 0, 
            y: widget.y || 0, 
            w: widget.w || 6, 
            h: widget.h || 4, 
            minW: 2, 
            minH: 2 
          }
          return (
            <div key={widget.id_widget} data-grid={fallbackGrid} className="relative">
              <WidgetContainer
                id={widget.id_widget}
                titulo={widget.titulo || widget.tipo}
                editMode={editMode}
                onEdit={editMode && widget.tipo === 'custom' ? () => onEditWidget(widget) : undefined}
                onDelete={editMode ? () => onDeleteWidget(widget.id_widget) : undefined}
              >
                {renderWidgetContent(widget)}
              </WidgetContainer>
            </div>
          )
        })}
      </GridLayout>
    </div>
  )
}
