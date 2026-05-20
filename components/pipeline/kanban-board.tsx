'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Seller, PipelineType, PriorityLevel } from '@/lib/types/seller'
import { getPipelineStages, getPriorityColor } from '@/lib/data/pipeline-stages'
import { KanbanColumn } from './kanban-column'
import { PipelineFilters } from './pipeline-filters'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  sellers: Seller[]
  pipelineType: PipelineType
}

export function KanbanBoard({ sellers: initialSellers, pipelineType }: KanbanBoardProps) {
  const [sellers, setSellers] = useState<Seller[]>(initialSellers)
  const [samManagerFilter, setSamManagerFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all')
  const [activeSeller, setActiveSeller] = useState<Seller | null>(null)

  const stages = getPipelineStages(pipelineType)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter sellers by pipeline type
  const pipelineSellers = useMemo(() => {
    return sellers.filter((seller) => seller.pipeline === pipelineType)
  }, [sellers, pipelineType])

  // Apply filters
  const filteredSellers = useMemo(() => {
    return pipelineSellers.filter((seller) => {
      // SAM Manager filter
      if (samManagerFilter !== 'all' && seller.samManager !== samManagerFilter) {
        return false
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        const score = seller.priorityScore
        if (priorityFilter === 'no-score' && score !== null) return false
        if (priorityFilter === 'critical' && (score === null || score >= 2.5)) return false
        if (priorityFilter === 'high' && (score === null || score < 2.5 || score >= 3.0)) return false
        if (priorityFilter === 'medium' && (score === null || score < 3.0 || score >= 3.5)) return false
        if (priorityFilter === 'low' && (score === null || score < 3.5)) return false
      }

      return true
    })
  }, [pipelineSellers, samManagerFilter, priorityFilter])

  // Group sellers by stage
  const sellersByStage = useMemo(() => {
    const grouped: Record<string, Seller[]> = {}
    stages.forEach((stage) => {
      grouped[stage.id] = filteredSellers.filter((seller) => seller.stage === stage.id)
    })
    return grouped
  }, [filteredSellers, stages])

  const totalCount = filteredSellers.length

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const seller = sellers.find((s) => s.id === active.id)
    if (seller) {
      setActiveSeller(seller)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveSeller(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the seller being dragged
    const draggedSeller = sellers.find((s) => s.id === activeId)
    if (!draggedSeller) return

    // Determine the target stage
    let targetStageId: string | null = null

    // Check if we dropped directly on a column
    const overData = over.data.current
    if (overData?.type === 'column') {
      targetStageId = overData.stage.id
    } else {
      // We dropped on another card, find which column it belongs to
      const overSeller = sellers.find((s) => s.id === overId)
      if (overSeller) {
        targetStageId = overSeller.stage
      }
    }

    if (!targetStageId || targetStageId === draggedSeller.stage) return

    // Update the seller's stage
    setSellers((prev) =>
      prev.map((seller) =>
        seller.id === activeId
          ? { ...seller, stage: targetStageId as string }
          : seller
      )
    )
  }

  const handleDragCancel = () => {
    setActiveSeller(null)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Stage Progress Bar */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-2">
            <span className={stage.color}>{stage.label}</span>
            <span className="text-slate-400">{sellersByStage[stage.id]?.length || 0}</span>
            {index < stages.length - 1 && (
              <span className="text-slate-300">→</span>
            )}
          </div>
        ))}
        <span className="ml-auto text-slate-500">{totalCount} total</span>
      </div>

      {/* Filters */}
      <PipelineFilters
        samManagerFilter={samManagerFilter}
        onSamManagerChange={setSamManagerFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {/* Kanban Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              sellers={sellersByStage[stage.id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeSeller ? (
            <DragOverlayCard seller={activeSeller} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function DragOverlayCard({ seller }: { seller: Seller }) {
  const priorityColors = getPriorityColor(seller.priorityScore)

  return (
    <div className="w-48 cursor-grabbing rounded-md border bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-slate-900">
          {seller.companyName}
        </span>
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
