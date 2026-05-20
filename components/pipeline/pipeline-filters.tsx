'use client'

import { cn } from '@/lib/utils'
import type { PriorityLevel } from '@/lib/types/seller'
import { acquisitionManagers } from '@/lib/data/mock-sellers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PipelineFiltersProps {
  samManagerFilter: string
  onSamManagerChange: (value: string) => void
  priorityFilter: PriorityLevel | 'all'
  onPriorityChange: (value: PriorityLevel | 'all') => void
}

const priorityOptions: { value: PriorityLevel | 'all'; label: string; color?: string }[] = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'no-score', label: 'No Score', color: 'bg-slate-100 text-slate-600 border-slate-200' },
]

export function PipelineFilters({
  samManagerFilter,
  onSamManagerChange,
  priorityFilter,
  onPriorityChange,
}: PipelineFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {/* SAM Manager Select */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">SAM Manager:</span>
        <Select value={samManagerFilter} onValueChange={onSamManagerChange}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="All managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All managers</SelectItem>
            {acquisitionManagers.map((manager) => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority Chips */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Priority:</span>
        <div className="flex gap-1.5">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onPriorityChange(priorityFilter === option.value ? 'all' : option.value)
              }
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                priorityFilter === option.value
                  ? option.color
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group by SAM Manager */}
      <div className="ml-auto flex items-center gap-2">
        <Checkbox id="group-sam" />
        <Label htmlFor="group-sam" className="text-sm text-slate-500 cursor-pointer">
          Group by SAM Manager
        </Label>
      </div>
    </div>
  )
}
