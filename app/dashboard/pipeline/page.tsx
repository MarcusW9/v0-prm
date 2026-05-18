import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { PipelineTabs } from '@/components/pipeline/pipeline-tabs'
import { mockSellers } from '@/lib/data/mock-sellers'

export default function PipelinePage() {
  return (
    <div className="flex h-full flex-col">
      <PipelineTabs />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-sm text-slate-500">
            Track partners through initial contact to approval
          </p>
        </div>
        <KanbanBoard sellers={mockSellers} pipelineType="acquisition" />
      </div>
    </div>
  )
}
