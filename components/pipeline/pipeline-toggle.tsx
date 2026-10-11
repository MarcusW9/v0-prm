'use client'

import { cn } from '@/lib/utils'
import type { PipelineType } from '@/lib/types/seller'

const tabs: { id: PipelineType; label: string }[] = [
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'account-management', label: 'Account Management' },
]

interface PipelineToggleProps {
  activeView: PipelineType
  onViewChange: (view: PipelineType) => void
}

export function PipelineToggle({ activeView, onViewChange }: PipelineToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeView === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
