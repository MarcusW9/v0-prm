'use client'

import { User, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Seller } from '@/lib/types/seller'
import { getPriorityColor } from '@/lib/data/pipeline-stages'

interface KanbanCardProps {
  seller: Seller
  onClick: () => void
}

export function KanbanCard({ seller, onClick }: KanbanCardProps) {
  const priorityColors = getPriorityColor(seller.priorityScore)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-900 leading-tight">
          {seller.companyName}
        </h4>
        {seller.priorityScore !== null && (
          <span
            className={cn(
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              priorityColors.bg,
              priorityColors.text
            )}
          >
            {seller.priorityScore.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{seller.contactName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{seller.contactEmail}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        <span>{seller.daysIdle}d ago</span>
      </div>
    </button>
  )
}
