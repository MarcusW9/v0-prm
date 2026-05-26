'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { PipelineToggle } from '@/components/pipeline/pipeline-toggle'
import { mockSellers } from '@/lib/data/mock-sellers'
import type { PipelineType } from '@/lib/types/seller'

const pipelineDescriptions: Record<PipelineType, string> = {
  acquisition: 'Track partners through initial contact to approval',
  onboarding: 'Manage partner onboarding from setup to go-live',
  'account-management': 'Monitor ongoing partner account health',
}

const validPipelineTypes: PipelineType[] = ['acquisition', 'onboarding', 'account-management']

function PipelineContent() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view')
  
  const initialView: PipelineType = validPipelineTypes.includes(viewParam as PipelineType) 
    ? (viewParam as PipelineType) 
    : 'acquisition'
  
  const [activeView, setActiveView] = useState<PipelineType>(initialView)

  // Update view when URL param changes
  useEffect(() => {
    if (viewParam && validPipelineTypes.includes(viewParam as PipelineType)) {
      setActiveView(viewParam as PipelineType)
    }
  }, [viewParam])

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

export default function PipelinePage() {
  return (
    <Suspense fallback={
      <div className="flex h-full flex-col">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-6" />
      </div>
    }>
      <PipelineContent />
    </Suspense>
  )
}
