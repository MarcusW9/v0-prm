'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink } from 'lucide-react'
import type { Seller, PipelineStage, PriorityLevel } from '@/lib/types/seller'
import { getStageDefinition, getPriorityColor } from '@/lib/data/pipeline-stages'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface PartnersTableProps {
  sellers: Seller[]
}

const priorityOptions: { value: PriorityLevel | 'all'; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'no-score', label: 'No Score' },
]

const pipelineStageOptions: { value: PipelineStage | 'all'; label: string }[] = [
  { value: 'initial-contact', label: 'Initial Contact' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'unresponsive', label: 'Unresponsive' },
  { value: 'handed-off', label: 'Handed Off' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
]

export function PartnersTable({ sellers }: PartnersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'stage'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [priorityFilters, setPriorityFilters] = useState<(PriorityLevel | 'all')[]>([])
  const [pipelineFilters, setPipelineFilters] = useState<(PipelineStage | 'all')[]>([])

  const togglePriorityFilter = (priority: PriorityLevel | 'all') => {
    setPriorityFilters((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    )
  }

  const togglePipelineFilter = (stage: PipelineStage | 'all') => {
    setPipelineFilters((prev) =>
      prev.includes(stage)
        ? prev.filter((s) => s !== stage)
        : [...prev, stage]
    )
  }

  const filteredSellers = useMemo(() => {
    return sellers
      .filter((seller) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !seller.companyName.toLowerCase().includes(query) &&
            !seller.contactName.toLowerCase().includes(query) &&
            !seller.contactEmail.toLowerCase().includes(query)
          ) {
            return false
          }
        }

        // Stage filter
        if (stageFilter !== 'all' && seller.stage !== stageFilter) {
          return false
        }

        // Priority filters
        if (priorityFilters.length > 0) {
          const score = seller.priorityScore
          const matchesPriority = priorityFilters.some((filter) => {
            if (filter === 'no-score' && score === null) return true
            if (filter === 'critical' && score !== null && score < 2.5) return true
            if (filter === 'high' && score !== null && score >= 2.5 && score < 3.0) return true
            if (filter === 'medium' && score !== null && score >= 3.0 && score < 3.5) return true
            if (filter === 'low' && score !== null && score >= 3.5) return true
            return false
          })
          if (!matchesPriority) return false
        }

        // Pipeline stage filters
        if (pipelineFilters.length > 0) {
          if (!pipelineFilters.includes(seller.stage as PipelineStage)) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const comparison = a.companyName.localeCompare(b.companyName)
          return sortOrder === 'asc' ? comparison : -comparison
        }
        const comparison = a.stage.localeCompare(b.stage)
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [sellers, searchQuery, stageFilter, priorityFilters, pipelineFilters, sortBy, sortOrder])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Partners</h1>
          <p className="text-sm text-slate-500">
            Showing {filteredSellers.length} partners
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Filters Row 1 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {pipelineStageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'stage')}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row 2 - Priority */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Priority:</span>
        {priorityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => togglePriorityFilter(option.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
              priorityFilters.includes(option.value)
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filters Row 3 - Pipeline */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Pipeline:</span>
        {pipelineStageOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => togglePipelineFilter(option.value as PipelineStage)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
              pipelineFilters.includes(option.value as PipelineStage)
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Partner</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-[80px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.map((seller) => {
              const stageDefinition = getStageDefinition(seller.stage)
              const priorityColors = getPriorityColor(seller.priorityScore)

              return (
                <TableRow
                  key={seller.id}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <TableCell>
                    <Link href={`/dashboard/partners/${seller.id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-slate-200">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(seller.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">
                          {seller.companyName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {seller.contactName}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {stageDefinition && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-medium',
                          stageDefinition.bgColor,
                          stageDefinition.color,
                          'border-0'
                        )}
                      >
                        {stageDefinition.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {seller.priorityScore !== null ? (
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                          priorityColors.bg,
                          priorityColors.text
                        )}
                      >
                        {seller.priorityScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={`/dashboard/partners/${seller.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
