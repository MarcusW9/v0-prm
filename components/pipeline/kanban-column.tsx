'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import type { Seller } from '@/lib/types/seller'
import type { StageDefinition } from '@/lib/types/seller'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  stage: StageDefinition
  sellers: Seller[]
}

export function KanbanColumn({ stage, sellers }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'column',
      stage,
    },
  })

  const sellerIds = sellers.map((s) => s.id)

  return (
    <div className={cn(
      "flex w-48 flex-shrink-0 flex-col rounded-lg",
      stage.bgColor
    )}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h3 className={cn("text-sm font-medium", stage.color)}>{stage.label}</h3>
        <span className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-xs font-medium",
          "bg-white/60",
          stage.color
        )}>
          {sellers.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-3 px-3 pb-3 transition-colors',
          isOver && 'ring-2 ring-inset ring-blue-400 rounded-b-lg'
        )}
      >
        <SortableContext items={sellerIds} strategy={verticalListSortingStrategy}>
          {sellers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <span className="text-sm text-slate-400">Drop here</span>
            </div>
          ) : (
            sellers.map((seller) => (
              <KanbanCard key={seller.id} seller={seller} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
