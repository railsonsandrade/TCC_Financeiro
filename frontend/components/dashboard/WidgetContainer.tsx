'use client'

import { GripVertical, Pencil, X } from 'lucide-react'

interface WidgetContainerProps {
  id: string
  titulo: string
  editMode: boolean
  onEdit?: () => void
  onDelete?: () => void
  children: React.ReactNode
}

export default function WidgetContainer({
  titulo,
  editMode,
  onEdit,
  onDelete,
  children,
}: WidgetContainerProps) {
  return (
    <div className="relative h-full flex flex-col bg-[#12161f] border border-[#222834] rounded-2xl overflow-hidden shadow-lg group">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-[#222834] bg-[#151a22] flex-shrink-0 ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          {editMode && (
            <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-gray-200 truncate">{titulo}</span>
        </div>

        {editMode && (
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                title="Editar widget"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Remover widget"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4">
        {children}
      </div>

      {/* Resize handle hint in edit mode */}
      {editMode && (
        <div className="absolute bottom-1 right-1 w-3 h-3 opacity-30 pointer-events-none">
          <svg viewBox="0 0 12 12" fill="none" className="text-gray-400 w-full h-full">
            <path d="M11 1L1 11M11 6L6 11M11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}
