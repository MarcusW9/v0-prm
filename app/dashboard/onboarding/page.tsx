import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { PipelineTabs } from '@/components/pipeline/pipeline-tabs'
import { mockSellers } from '@/lib/data/mock-sellers'

export default function OnboardingPage() {
  return (
    <div className="flex h-full flex-col">
      <PipelineTabs />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Onboarding Pipeline</h1>
          <p className="text-sm text-slate-500">
            Track partners through the onboarding process
          </p>
        </div>
        <KanbanBoard sellers={mockSellers} pipelineType="onboarding" />
      </div>
    </div>
  )
}
