'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink, Download, X, ChevronDown, Check, Filter } from 'lucide-react'
import type { Seller, PipelineStage, PriorityLevel, SellerCategory, IntegrationMethod, Agency, PipelineType } from '@/lib/types/seller'
import { getStageDefinition, getPriorityColor, acquisitionStages, onboardingStages, accountManagementStages, pipelines } from '@/lib/data/pipeline-stages'
import { 
  acquisitionManagers, 
  onboardingManagers, 
  accountManagers,
  categoryOptions,
  integrationOptions,
  agencyOptions
} from '@/lib/data/mock-sellers'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Checkbox } from '@/components/ui/checkbox'

interface PartnersTableProps {
  sellers: Seller[]
}

const priorityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'no-score', label: 'No Score' },
]

const allStages = [...acquisitionStages, ...onboardingStages, ...accountManagementStages]
const allManagers = [...new Set([...acquisitionManagers, ...onboardingManagers, ...accountManagers])]

// Filter chip colors for visual distinction
const filterColors: Record<string, { bg: string; text: string; border: string }> = {
  category: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  integration: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  agency: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  manager: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  pipeline: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  stage: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  priority: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
}

interface FilterDropdownProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (value: T) => void
  colorKey: keyof typeof filterColors
}

function FilterDropdown<T extends string>({ 
  label, 
  options, 
  selected, 
  onToggle,
  colorKey 
}: FilterDropdownProps<T>) {
  const hasSelection = selected.length > 0
  const colors = filterColors[colorKey]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 justify-between gap-2 font-normal',
            hasSelection && `${colors.bg} ${colors.text} ${colors.border} border`
          )}
        >
          {label}
          {hasSelection && (
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
              colors.bg, colors.text
            )}>
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() => onToggle(option.value)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isSelected 
                    ? `${colors.bg} ${colors.text}` 
                    : 'hover:bg-slate-100'
                )}
              >
                <Checkbox 
                  checked={isSelected} 
                  className={cn(
                    'pointer-events-none',
                    isSelected && colors.border
                  )}
                />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function PartnersTable({ sellers }: PartnersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'stage'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  
  // Multi-select filter states
  const [selectedCategories, setSelectedCategories] = useState<SellerCategory[]>([])
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationMethod[]>([])
  const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([])
  const [selectedManagers, setSelectedManagers] = useState<string[]>([])
  const [selectedPipelines, setSelectedPipelines] = useState<PipelineType[]>([])
  const [selectedStages, setSelectedStages] = useState<PipelineStage[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityLevel[]>([])

  const toggleFilter = <T,>(
    value: T,
    selected: T[],
    setSelected: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedIntegrations([])
    setSelectedAgencies([])
    setSelectedManagers([])
    setSelectedPipelines([])
    setSelectedStages([])
    setSelectedPriorities([])
    setSearchQuery('')
  }

  const filteredSellers = useMemo(() => {
    return sellers
      .filter((seller) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !seller.companyName.toLowerCase().includes(query) &&
        !seller.primaryContact.name.toLowerCase().includes(query) &&
        !seller.primaryContact.email.toLowerCase().includes(query)
          ) {
            return false
          }
        }

        // Category filter (OR within, AND with other filters)
        if (selectedCategories.length > 0 && !selectedCategories.includes(seller.category)) {
          return false
        }

        // Integration filter
        if (selectedIntegrations.length > 0) {
          if (!seller.integrationMethod || !selectedIntegrations.includes(seller.integrationMethod)) {
            return false
          }
        }

        // Agency filter
        if (selectedAgencies.length > 0 && !selectedAgencies.includes(seller.agency)) {
          return false
        }

        // Manager filter (any of the three managers)
        if (selectedManagers.length > 0) {
          const sellerManagers = [
            seller.acquisitionManager,
            seller.onboardingManager,
            seller.accountManager,
          ].filter(Boolean)
          const hasMatchingManager = selectedManagers.some((m) => sellerManagers.includes(m))
          if (!hasMatchingManager) return false
        }

        // Pipeline filter
        if (selectedPipelines.length > 0 && !selectedPipelines.includes(seller.pipeline)) {
          return false
        }

        // Stage filter
        if (selectedStages.length > 0 && !selectedStages.includes(seller.stage)) {
          return false
        }

        // Priority filter
        if (selectedPriorities.length > 0) {
          const score = seller.priorityScore
          const matchesPriority = selectedPriorities.some((filter) => {
            if (filter === 'no-score' && score === null) return true
            if (filter === 'critical' && score !== null && score < 2.5) return true
            if (filter === 'high' && score !== null && score >= 2.5 && score < 3.0) return true
            if (filter === 'medium' && score !== null && score >= 3.0 && score < 3.5) return true
            if (filter === 'low' && score !== null && score >= 3.5) return true
            return false
          })
          if (!matchesPriority) return false
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
  }, [
    sellers,
    searchQuery,
    selectedCategories,
    selectedIntegrations,
    selectedAgencies,
    selectedManagers,
    selectedPipelines,
    selectedStages,
    selectedPriorities,
    sortBy,
    sortOrder,
  ])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const exportToCSV = () => {
    const headers = [
      'Company Name',
      'CRN',
      'Contact Name',
      'Contact Email',
      'Contact Phone',
      'Pipeline',
      'Stage',
      'Priority Score',
      'Category',
      'Integration Method',
      'Agency',
      'Acquisition Manager',
      'Onboarding Manager',
      'Account Manager',
      'GMV Potential',
      'Health Status',
    ]

    const rows = filteredSellers.map((seller) => [
      seller.companyName,
      seller.crn,
      seller.primaryContact.name,
      seller.primaryContact.email,
      seller.primaryContact.phone,
      seller.pipeline,
      seller.stage,
      seller.priorityScore?.toString() ?? '',
      seller.category,
      seller.integrationMethod ?? '',
      seller.agency,
      seller.acquisitionManager ?? '',
      seller.onboardingManager ?? '',
      seller.accountManager ?? '',
      seller.gmvPotential ?? '',
      seller.healthStatus ?? '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `partners_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedIntegrations.length > 0 ||
    selectedAgencies.length > 0 ||
    selectedManagers.length > 0 ||
    selectedPipelines.length > 0 ||
    selectedStages.length > 0 ||
    selectedPriorities.length > 0 ||
    searchQuery.length > 0

  const totalActiveFilters = 
    selectedCategories.length +
    selectedIntegrations.length +
    selectedAgencies.length +
    selectedManagers.length +
    selectedPipelines.length +
    selectedStages.length +
    selectedPriorities.length

  const activeFilterChips: { label: string; type: keyof typeof filterColors; onRemove: () => void }[] = [
    ...selectedCategories.map((c) => ({
      label: categoryOptions.find((o) => o.value === c)?.label || c,
      type: 'category' as const,
      onRemove: () => toggleFilter(c, selectedCategories, setSelectedCategories),
    })),
    ...selectedIntegrations.map((i) => ({
      label: integrationOptions.find((o) => o.value === i)?.label || i,
      type: 'integration' as const,
      onRemove: () => toggleFilter(i, selectedIntegrations, setSelectedIntegrations),
    })),
    ...selectedAgencies.map((a) => ({
      label: agencyOptions.find((o) => o.value === a)?.label || a,
      type: 'agency' as const,
      onRemove: () => toggleFilter(a, selectedAgencies, setSelectedAgencies),
    })),
    ...selectedManagers.map((m) => ({
      label: m,
      type: 'manager' as const,
      onRemove: () => toggleFilter(m, selectedManagers, setSelectedManagers),
    })),
    ...selectedPipelines.map((p) => ({
      label: pipelines.find((pl) => pl.id === p)?.label || p,
      type: 'pipeline' as const,
      onRemove: () => toggleFilter(p, selectedPipelines, setSelectedPipelines),
    })),
    ...selectedStages.map((s) => ({
      label: allStages.find((st) => st.id === s)?.label || s,
      type: 'stage' as const,
      onRemove: () => toggleFilter(s, selectedStages, setSelectedStages),
    })),
    ...selectedPriorities.map((p) => ({
      label: priorityOptions.find((o) => o.value === p)?.label || p,
      type: 'priority' as const,
      onRemove: () => toggleFilter(p, selectedPriorities, setSelectedPriorities),
    })),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Partners</h1>
          <p className="text-sm text-slate-500">
            Showing {filteredSellers.length} of {sellers.length} partners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredSellers.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Search and Sort Row */}
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

      {/* Collapsible Filter Section */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by...
              {totalActiveFilters > 0 && (
                <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                  {totalActiveFilters} active
                </Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isFilterOpen && 'rotate-180'
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-slate-50 p-4">
            <FilterDropdown
              label="Category"
              options={categoryOptions as { value: SellerCategory; label: string }[]}
              selected={selectedCategories}
              onToggle={(v) => toggleFilter(v, selectedCategories, setSelectedCategories)}
              colorKey="category"
            />

            <FilterDropdown
              label="Integration"
              options={integrationOptions as { value: IntegrationMethod; label: string }[]}
              selected={selectedIntegrations}
              onToggle={(v) => toggleFilter(v, selectedIntegrations, setSelectedIntegrations)}
              colorKey="integration"
            />

            <FilterDropdown
              label="Agency"
              options={agencyOptions as { value: Agency; label: string }[]}
              selected={selectedAgencies}
              onToggle={(v) => toggleFilter(v, selectedAgencies, setSelectedAgencies)}
              colorKey="agency"
            />

            <FilterDropdown
              label="Manager"
              options={allManagers.map((m) => ({ value: m, label: m }))}
              selected={selectedManagers}
              onToggle={(v) => toggleFilter(v, selectedManagers, setSelectedManagers)}
              colorKey="manager"
            />

            <FilterDropdown
              label="Pipeline"
              options={pipelines.map((p) => ({ value: p.id, label: p.label })) as { value: PipelineType; label: string }[]}
              selected={selectedPipelines}
              onToggle={(v) => toggleFilter(v, selectedPipelines, setSelectedPipelines)}
              colorKey="pipeline"
            />

            <FilterDropdown
              label="Stage"
              options={allStages.map((s) => ({ value: s.id, label: s.label })) as { value: PipelineStage; label: string }[]}
              selected={selectedStages}
              onToggle={(v) => toggleFilter(v, selectedStages, setSelectedStages)}
              colorKey="stage"
            />

            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              selected={selectedPriorities}
              onToggle={(v) => toggleFilter(v, selectedPriorities, setSelectedPriorities)}
              colorKey="priority"
            />

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-slate-500 ml-auto">
                Clear all
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip, idx) => {
            const colors = filterColors[chip.type]
            return (
              <Badge
                key={idx}
                variant="secondary"
                className={cn(
                  'flex items-center gap-1.5 border px-3 py-1',
                  colors.bg,
                  colors.text,
                  colors.border
                )}
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className={cn(
                    'ml-1 rounded-full p-0.5 transition-colors',
                    'hover:bg-white/50'
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Partner</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Integration</TableHead>
              <TableHead className="w-[80px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No partners match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredSellers.map((seller) => {
                const stageDefinition = getStageDefinition(seller.stage)
                const priorityColors = getPriorityColor(seller.priorityScore)
                const categoryLabel = categoryOptions.find((c) => c.value === seller.category)?.label
                const integrationLabel = seller.integrationMethod
                  ? integrationOptions.find((i) => i.value === seller.integrationMethod)?.label
                  : null

                return (
                  <TableRow key={seller.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <Link href={`/dashboard/partners/${seller.id}`} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-slate-200">
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(seller.companyName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{seller.companyName}</div>
                          <div className="text-sm text-slate-500">{seller.primaryContact.name}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{categoryLabel}</span>
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
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {integrationLabel || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <Link href={`/dashboard/partners/${seller.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
