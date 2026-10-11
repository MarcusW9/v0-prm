'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { PipelineToggle } from '@/components/pipeline/pipeline-toggle'
import { mockSellers } from '@/lib/data/mock-sellers'
import type { PipelineType } from '@/lib/types/seller'

const pipelineDescriptions: Record<PipelineType, string> = {
  acquisition: 'Track partners through initial contact to approval',
  onboarding: 'Manage partner onboarding from setup to go-live',
  'account-management': 'Monitor ongoing partner account health',
}

export default function PipelinePage() {
  const [activeView, setActiveView] = useState<PipelineType>('acquisition')

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-500">
              {pipelineDescriptions[activeView]}
            </p>
          </div>
          <PipelineToggle activeView={activeView} onViewChange={setActiveView} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard sellers={mockSellers} pipelineType={activeView} />
      </div>
    </div>
  )
}
