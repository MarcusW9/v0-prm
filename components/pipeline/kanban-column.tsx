'use client'

import { cn } from '@/lib/utils'
import type { Seller } from '@/lib/types/seller'
import type { StageDefinition } from '@/lib/types/seller'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  stage: StageDefinition
  sellers: Seller[]
}

export function KanbanColumn({ stage, sellers }: KanbanColumnProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">{stage.label}</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
          {sellers.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        className={cn(
          'flex flex-1 flex-col gap-3 rounded-lg p-3',
          stage.bgColor
        )}
      >
        {sellers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <span className="text-sm text-slate-400">Drop here</span>
          </div>
        ) : (
          sellers.map((seller) => (
            <KanbanCard key={seller.id} seller={seller} />
          ))
        )}
      </div>
    </div>
  )
}
