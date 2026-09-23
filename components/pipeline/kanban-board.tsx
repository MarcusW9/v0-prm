'use client'

import { useState, useMemo } from 'react'
import type { Seller, PipelineType, PriorityLevel } from '@/lib/types/seller'
import { getPipelineStages } from '@/lib/data/pipeline-stages'
import { KanbanColumn } from './kanban-column'
import { PipelineFilters } from './pipeline-filters'

interface KanbanBoardProps {
  sellers: Seller[]
  pipelineType: PipelineType
}

export function KanbanBoard({ sellers, pipelineType }: KanbanBoardProps) {
  const [samManagerFilter, setSamManagerFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all')

  const stages = getPipelineStages(pipelineType)

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
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            sellers={sellersByStage[stage.id] || []}
          />
        ))}
      </div>
    </div>
  )
}
