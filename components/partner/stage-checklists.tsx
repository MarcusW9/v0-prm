'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { PipelineStage, PipelineType, ChecklistItemCompletion } from '@/lib/types/seller'
import type { StageChecklist, ChecklistItem, PipelineChecklists } from '@/lib/data/stage-checklists'
import { allPipelineChecklists, getPipelineForStage } from '@/lib/data/stage-checklists'

interface StageChecklistProps {
  currentStage: PipelineStage
  currentPipeline: PipelineType
  checklistProgress: Record<string, ChecklistItemCompletion>
  onItemChange: (itemId: string, completed: boolean, value?: string) => void
}

function ChecklistItemRow({
  item,
  completion,
  onChange,
}: {
  item: ChecklistItem
  completion?: ChecklistItemCompletion
  onChange: (completed: boolean, value?: string) => void
}) {
  const isCompleted = completion?.completed ?? false
  const value = completion?.value ?? ''

  if (item.type === 'checkbox') {
    return (
      <div className="flex items-center gap-3 py-2">
        <Checkbox
          id={item.id}
          checked={isCompleted}
          onCheckedChange={(checked) => onChange(checked === true)}
          className="h-4 w-4"
        />
        <label
          htmlFor={item.id}
          className={cn(
            'text-sm cursor-pointer flex-1',
            isCompleted && 'text-muted-foreground line-through'
          )}
        >
          {item.label}
          {item.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {completion?.completedAt && (
          <span className="text-xs text-muted-foreground">
            {completion.completedAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    )
  }

  if (item.type === 'dropdown') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1">
          <label className="text-sm block mb-1">
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Select
            value={value || undefined}
            onValueChange={(val) => onChange(true, val)}
          >
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {completion?.completedAt && (
          <span className="text-xs text-muted-foreground self-end pb-1">
            {completion.completedAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>
    )
  }

  if (item.type === 'text' || item.type === 'currency') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1">
          <label className="text-sm block mb-1">
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            {item.type === 'currency' && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                £
              </span>
            )}
            <Input
              value={value}
              onChange={(e) => onChange(!!e.target.value, e.target.value)}
              placeholder={item.type === 'currency' ? '0.00' : 'Enter value...'}
              className={cn('h-8 text-sm', item.type === 'currency' && 'pl-6')}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

function StageSection({
  checklist,
  currentStage,
  currentPipeline,
  pipelineId,
  stageOrder,
  checklistProgress,
  onItemChange,
}: {
  checklist: StageChecklist
  currentStage: PipelineStage
  currentPipeline: PipelineType
  pipelineId: PipelineType
  stageOrder: PipelineStage[]
  checklistProgress: Record<string, ChecklistItemCompletion>
  onItemChange: (itemId: string, completed: boolean, value?: string) => void
}) {
  const isCurrentPipeline = pipelineId === currentPipeline
  const isCurrentStage = checklist.stageId === currentStage && isCurrentPipeline
  const [isOpen, setIsOpen] = useState(isCurrentStage)

  const currentIndex = stageOrder.indexOf(currentStage)
  const stageIndex = stageOrder.indexOf(checklist.stageId as PipelineStage)
  const isPastStage = isCurrentPipeline && stageIndex < currentIndex && stageIndex !== -1
  const isFutureStage = isCurrentPipeline && stageIndex > currentIndex

  // Count completed items
  const completedCount = checklist.items.filter(
    (item) => checklistProgress[item.id]?.completed
  ).length
  const totalCount = checklist.items.length
  const allComplete = completedCount === totalCount

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border bg-background p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-center">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2',
            isPastStage && allComplete && 'border-emerald-500 bg-emerald-500',
            isPastStage && !allComplete && 'border-amber-500 bg-amber-500',
            isCurrentStage && 'border-blue-500 bg-blue-50',
            (isFutureStage || !isCurrentPipeline) && 'border-slate-300 bg-slate-50'
          )}
        >
          {(isPastStage && allComplete) ? (
            <Check className="h-3.5 w-3.5 text-white" />
          ) : isPastStage && !allComplete ? (
            <span className="text-xs font-medium text-white">!</span>
          ) : (
            <Circle
              className={cn(
                'h-2 w-2',
                isCurrentStage ? 'fill-blue-500 text-blue-500' : 'fill-slate-300 text-slate-300'
              )}
            />
          )}
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span
            className={cn(
              'text-sm font-medium',
              isCurrentStage && 'text-blue-700',
              (isFutureStage || !isCurrentPipeline) && 'text-muted-foreground'
            )}
          >
            {checklist.stageLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-1 border-l-2 border-slate-200 pl-6 pb-2">
          {checklist.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              completion={checklistProgress[item.id]}
              onChange={(completed, value) => onItemChange(item.id, completed, value)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function PipelineSection({
  pipeline,
  currentStage,
  currentPipeline,
  checklistProgress,
  onItemChange,
}: {
  pipeline: PipelineChecklists
  currentStage: PipelineStage
  currentPipeline: PipelineType
  checklistProgress: Record<string, ChecklistItemCompletion>
  onItemChange: (itemId: string, completed: boolean, value?: string) => void
}) {
  const isCurrentPipeline = pipeline.pipelineId === currentPipeline
  const [isOpen, setIsOpen] = useState(isCurrentPipeline)

  const stageOrder = pipeline.stages.map(s => s.stageId)

  // Calculate pipeline progress
  const totalItems = pipeline.stages.reduce((acc, stage) => acc + stage.items.length, 0)
  const completedItems = pipeline.stages.reduce((acc, stage) => {
    return acc + stage.items.filter(item => checklistProgress[item.id]?.completed).length
  }, 0)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(
        "flex w-full items-center gap-3 rounded-lg p-4 transition-colors",
        isCurrentPipeline 
          ? "bg-blue-50 border-2 border-blue-200 hover:bg-blue-100" 
          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
      )}>
        <div className="flex items-center justify-center">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-base font-semibold",
              isCurrentPipeline ? "text-blue-700" : "text-slate-700"
            )}>
              {pipeline.pipelineLabel}
            </span>
            {isCurrentPipeline && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {completedItems}/{totalItems} items
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-4">
          {pipeline.stages.map((checklist) => (
            <StageSection
              key={checklist.stageId}
              checklist={checklist}
              currentStage={currentStage}
              currentPipeline={currentPipeline}
              pipelineId={pipeline.pipelineId}
              stageOrder={stageOrder}
              checklistProgress={checklistProgress}
              onItemChange={onItemChange}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function StageChecklists({
  currentStage,
  currentPipeline,
  checklistProgress,
  onItemChange,
}: StageChecklistProps) {
  return (
    <div className="space-y-4">
      {allPipelineChecklists.map((pipeline) => (
        <PipelineSection
          key={pipeline.pipelineId}
          pipeline={pipeline}
          currentStage={currentStage}
          currentPipeline={currentPipeline}
          checklistProgress={checklistProgress}
          onItemChange={onItemChange}
        />
      ))}
    </div>
  )
}

// Helper to check if checklist has incomplete items
export function hasIncompleteItems(
  checklist: StageChecklist,
  progress: Record<string, ChecklistItemCompletion>
): string[] {
  return checklist.items
    .filter((item) => !progress[item.id]?.completed)
    .map((item) => item.label)
}
