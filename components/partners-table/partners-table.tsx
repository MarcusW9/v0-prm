'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink, Download, X } from 'lucide-react'
import type { Seller, PipelineStage, PriorityLevel, SellerCategory, IntegrationMethod, Agency } from '@/lib/types/seller'
import { getStageDefinition, getPriorityColor, acquisitionStages, onboardingStages, accountManagementStages } from '@/lib/data/pipeline-stages'
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

const priorityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'no-score', label: 'No Score' },
]

const allStages = [...acquisitionStages, ...onboardingStages, ...accountManagementStages]
const allManagers = [...new Set([...acquisitionManagers, ...onboardingManagers, ...accountManagers])]

export function PartnersTable({ sellers }: PartnersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'stage'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Multi-select filter states
  const [selectedCategories, setSelectedCategories] = useState<SellerCategory[]>([])
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationMethod[]>([])
  const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([])
  const [selectedManagers, setSelectedManagers] = useState<string[]>([])
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
            !seller.contactName.toLowerCase().includes(query) &&
            !seller.contactEmail.toLowerCase().includes(query)
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
      seller.contactName,
      seller.contactEmail,
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
    selectedStages.length > 0 ||
    selectedPriorities.length > 0 ||
    searchQuery.length > 0

  const activeFilterChips: { label: string; onRemove: () => void }[] = [
    ...selectedCategories.map((c) => ({
      label: `Category: ${categoryOptions.find((o) => o.value === c)?.label}`,
      onRemove: () => toggleFilter(c, selectedCategories, setSelectedCategories),
    })),
    ...selectedIntegrations.map((i) => ({
      label: `Integration: ${integrationOptions.find((o) => o.value === i)?.label}`,
      onRemove: () => toggleFilter(i, selectedIntegrations, setSelectedIntegrations),
    })),
    ...selectedAgencies.map((a) => ({
      label: `Agency: ${agencyOptions.find((o) => o.value === a)?.label}`,
      onRemove: () => toggleFilter(a, selectedAgencies, setSelectedAgencies),
    })),
    ...selectedManagers.map((m) => ({
      label: `Manager: ${m}`,
      onRemove: () => toggleFilter(m, selectedManagers, setSelectedManagers),
    })),
    ...selectedStages.map((s) => ({
      label: `Stage: ${allStages.find((st) => st.id === s)?.label}`,
      onRemove: () => toggleFilter(s, selectedStages, setSelectedStages),
    })),
    ...selectedPriorities.map((p) => ({
      label: `Priority: ${priorityOptions.find((o) => o.value === p)?.label}`,
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

      {/* Filter Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Select
          value={selectedCategories.length === 1 ? selectedCategories[0] : ''}
          onValueChange={(v) => toggleFilter(v as SellerCategory, selectedCategories, setSelectedCategories)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {selectedCategories.includes(opt.value as SellerCategory) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Integration Filter */}
        <Select
          value={selectedIntegrations.length === 1 ? selectedIntegrations[0] : ''}
          onValueChange={(v) => toggleFilter(v as IntegrationMethod, selectedIntegrations, setSelectedIntegrations)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Integration" />
          </SelectTrigger>
          <SelectContent>
            {integrationOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {selectedIntegrations.includes(opt.value as IntegrationMethod) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Agency Filter */}
        <Select
          value={selectedAgencies.length === 1 ? selectedAgencies[0] : ''}
          onValueChange={(v) => toggleFilter(v as Agency, selectedAgencies, setSelectedAgencies)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agency" />
          </SelectTrigger>
          <SelectContent>
            {agencyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {selectedAgencies.includes(opt.value as Agency) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Manager Filter */}
        <Select
          value={selectedManagers.length === 1 ? selectedManagers[0] : ''}
          onValueChange={(v) => toggleFilter(v, selectedManagers, setSelectedManagers)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Manager" />
          </SelectTrigger>
          <SelectContent>
            {allManagers.map((manager) => (
              <SelectItem key={manager} value={manager}>
                <span className="flex items-center gap-2">
                  {selectedManagers.includes(manager) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {manager}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stage Filter */}
        <Select
          value={selectedStages.length === 1 ? selectedStages[0] : ''}
          onValueChange={(v) => toggleFilter(v as PipelineStage, selectedStages, setSelectedStages)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            {allStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <span className="flex items-center gap-2">
                  {selectedStages.includes(stage.id as PipelineStage) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {stage.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={selectedPriorities.length === 1 ? selectedPriorities[0] : ''}
          onValueChange={(v) => toggleFilter(v as PriorityLevel, selectedPriorities, setSelectedPriorities)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {selectedPriorities.includes(opt.value) && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-slate-500">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-1 rounded-full p-0.5 hover:bg-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
                          <div className="text-sm text-slate-500">{seller.contactName}</div>
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
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{integrationLabel ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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
