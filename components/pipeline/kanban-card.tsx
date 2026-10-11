'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Seller } from '@/lib/types/seller'
import { getPriorityColor } from '@/lib/data/pipeline-stages'

interface KanbanCardProps {
  seller: Seller
}

export function KanbanCard({ seller }: KanbanCardProps) {
  const priorityColors = getPriorityColor(seller.priorityScore)

  return (
    <Link
      href={`/dashboard/partners/${seller.id}`}
      className="block w-full rounded-md border bg-white px-3 py-2 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="truncate text-sm font-medium text-slate-900">
          {seller.companyName}
        </h4>
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
    </Link>
  )
}
