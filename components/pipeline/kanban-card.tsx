'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Seller } from '@/lib/types/seller'
import { getPriorityColor } from '@/lib/data/pipeline-stages'

interface KanbanCardProps {
  seller: Seller
}

export function KanbanCard({ seller }: KanbanCardProps) {
  const priorityColors = getPriorityColor(seller.priorityScore)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: seller.id,
    data: {
      type: 'card',
      seller,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'block w-full cursor-grab rounded-md border bg-white px-3 py-2 text-left shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/dashboard/partners/${seller.id}`}
          className="truncate text-sm font-medium text-slate-900 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {seller.companyName}
        </Link>
        {seller.priorityScore !== null && (
          <span
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              priorityColors.bg,
              priorityColors.text
            )}
          >
            {seller.priorityScore.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}
