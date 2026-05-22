'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockSellers, mockNotes, mockFiles, acquisitionManagers, onboardingManagers, accountManagers } from '@/lib/data/mock-sellers'
import { getStageDefinition, acquisitionStages } from '@/lib/data/pipeline-stages'
import { pipelines } from '@/lib/data/pipeline-stages'
import { getPriorityColor } from '@/lib/data/pipeline-stages'
import { getChecklistForStage } from '@/lib/data/stage-checklists'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  FileText, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Globe,
  FileCheck,
  Calendar,
  Users,
  GripVertical,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { StageChecklists, hasIncompleteItems } from '@/components/partner/stage-checklists'
import { IncompleteChecklistDialog } from '@/components/partner/incomplete-checklist-dialog'
import { ContactManagement } from '@/components/partner/contact-management'
import type { AcquisitionStage, ChecklistItemCompletion, Contact } from '@/lib/types/seller'

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>
}

// Sortable card wrapper component
interface SortableCardProps {
  id: string
  children: React.ReactNode
  isFullWidth?: boolean
}

// Helper to get human-readable reason labels
const reasonLabels: Record<string, string> = {
  'awaiting-documents': 'Awaiting documents from seller',
  'compliance-review': 'Pending compliance review',
  'seller-request': 'Requested by seller',
  'internal-review': 'Internal review required',
  'compliance-failure': 'Failed compliance requirements',
  'seller-withdrew': 'Seller withdrew application',
  'business-closed': 'Business closed',
  'duplicate': 'Duplicate entry',
  'fraud': 'Suspected fraud',
  'other': 'Other',
}

function SortableCard({ id, children, isFullWidth = false }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isFullWidth ? 'lg:col-span-2' : 'min-w-0')}
    >
      <div className="relative group h-full">
        <button
          {...attributes}
          {...listeners}
          className="absolute right-2 top-3 z-10 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        {children}
      </div>
    </div>
  )
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [newNote, setNewNote] = useState('')
  
  // Seller lifecycle status state
  const [sellerStatus, setSellerStatus] = useState<'active' | 'delayed' | 'terminated'>('active')
  const [statusReason, setStatusReason] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [delayedReason, setDelayedReason] = useState('')
  const [delayedNotes, setDelayedNotes] = useState('')
  const [terminateReason, setTerminateReason] = useState('')
  const [terminateNotes, setTerminateNotes] = useState('')
  
  // Terminate confirmation dialog state
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [terminateConfirmText, setTerminateConfirmText] = useState('')
  
  // Drag and drop for overview sections
  const [sectionOrder, setSectionOrder] = useState([
    'supplier-details',
    'business-metrics',
    'contact-details', 
    'assignment',
    'compliance-checks',
  ])
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }
  
  // Copy to clipboard
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }
  
  // Find seller
  const seller = mockSellers.find((s) => s.id === id)
  
  // Checklist state
  const [checklistProgress, setChecklistProgress] = useState<Record<string, ChecklistItemCompletion>>({})
  const [currentStage, setCurrentStage] = useState<AcquisitionStage>(
    (seller?.stage as AcquisitionStage) || 'identified'
  )
  
  // Dialog state for incomplete checklist warning
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false)
  const [pendingStageChange, setPendingStageChange] = useState<AcquisitionStage | null>(null)
  const [incompleteItems, setIncompleteItems] = useState<string[]>([])
  
  // Contact state
  const [primaryContact, setPrimaryContact] = useState<Contact>(seller?.primaryContact || {
    id: 'new',
    name: '',
    email: '',
    phone: '',
    role: 'account',
  })
  const [additionalContacts, setAdditionalContacts] = useState<Contact[]>(seller?.additionalContacts || [])
  
  if (!seller) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Partner not found</p>
      </div>
    )
  }

  const stageDefinition = getStageDefinition(currentStage)
  const priorityColors = getPriorityColor(seller.priorityScore)
  const sellerNotes = mockNotes.filter((note) => note.sellerId === seller.id)
  const sellerFiles = mockFiles.filter((file) => file.sellerId === seller.id)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
    }
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }
    toast.success('Note added successfully')
    setNewNote('')
  }

  const handleChecklistItemChange = (itemId: string, completed: boolean, value?: string) => {
    setChecklistProgress((prev) => ({
      ...prev,
      [itemId]: {
        itemId,
        completed,
        value,
        completedAt: completed ? new Date() : undefined,
        completedBy: 'Current User',
      },
    }))
  }

  const handleStageChange = (newStage: AcquisitionStage) => {
    // Check if current stage has incomplete items
    const currentChecklist = getChecklistForStage(currentStage)
    if (currentChecklist) {
      const missing = hasIncompleteItems(currentChecklist, checklistProgress)
      if (missing.length > 0) {
        setIncompleteItems(missing)
        setPendingStageChange(newStage)
        setShowIncompleteDialog(true)
        return
      }
    }
    
    // No incomplete items, proceed with stage change
    completeStageChange(newStage)
  }

  const completeStageChange = (newStage: AcquisitionStage) => {
    setCurrentStage(newStage)
    toast.success(`Moved to ${getStageDefinition(newStage)?.label || newStage}`)
  }

  const handleConfirmIncompleteMove = () => {
    if (pendingStageChange) {
      completeStageChange(pendingStageChange)
      setPendingStageChange(null)
    }
    setShowIncompleteDialog(false)
  }

  const formatAddress = (address: typeof seller.registeredAddress) => {
    const parts = [address.line1]
    if (address.line2) parts.push(address.line2)
    parts.push(address.city)
    parts.push(address.postcode)
    return parts.join(', ')
  }

  return (
    <TooltipProvider>
      {/* Full-width Top Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-background px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <TabsList className="h-14 bg-transparent p-0 gap-1">
              <TabsTrigger 
                value="overview" 
                className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="checklist"
                className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Checklist
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Notes
                {sellerNotes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-normal">
                    {sellerNotes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Files
                {sellerFiles.length > 0 && (
                  <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-normal">
                    {sellerFiles.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="management"
                className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Management
              </TabsTrigger>
            </TabsList>
          </div>
          {sellerStatus === 'terminated' ? (
            <Badge
              variant="secondary"
              className="h-9 px-4 text-sm bg-red-100 text-red-700 border-red-200 flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Terminated
            </Badge>
          ) : (
            <Select value={currentStage} onValueChange={(val) => handleStageChange(val as AcquisitionStage)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {acquisitionStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Supplier Details */}
          <div className={cn(
            "flex flex-col border-r bg-slate-100 transition-all duration-300 overflow-hidden",
            isSidebarExpanded ? "w-72" : "w-16"
          )}>
            {/* Supplier Details - Only when expanded */}
            {isSidebarExpanded ? (
              <div className="flex-1 overflow-y-auto">
                {/* Company Name Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-base">{seller.companyName}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Added {formatDate(seller.createdAt)}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsSidebarExpanded(false)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0"
                          aria-label="Collapse sidebar"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Collapse sidebar</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 text-slate-600"
                    >
                      {pipelines.find(p => p.id === seller.pipeline)?.label.replace(' Pipeline', '') || seller.pipeline}
                    </Badge>
                    {stageDefinition && (
                      <Badge
                        variant="secondary"
                        className={cn(stageDefinition.bgColor, stageDefinition.color, 'border-0 text-xs')}
                      >
                        {stageDefinition.label}
                      </Badge>
                    )}
                    {seller.priorityScore !== null && (
                      <span className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded",
                        priorityColors.bg,
                        priorityColors.text
                      )}>
                        {seller.priorityScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Status Info Bubble - shown when delayed or terminated */}
                    {sellerStatus !== 'active' && statusReason && (
                      <div className={cn(
                        "rounded-lg p-3 border",
                        sellerStatus === 'delayed' 
                          ? "bg-amber-50 border-amber-200" 
                          : "bg-red-50 border-red-200"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          {sellerStatus === 'delayed' ? (
                            <Clock className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Ban className="h-4 w-4 text-red-600" />
                          )}
                          <span className={cn(
                            "text-sm font-semibold",
                            sellerStatus === 'delayed' ? "text-amber-700" : "text-red-700"
                          )}>
                            {sellerStatus === 'delayed' ? 'Delayed' : 'Terminated'}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div>
                            <p className="text-xs text-muted-foreground">Reason</p>
                            <p className={cn(
                              "text-xs font-medium",
                              sellerStatus === 'delayed' ? "text-amber-800" : "text-red-800"
                            )}>
                              {reasonLabels[statusReason] || statusReason}
                            </p>
                          </div>
                          {statusNotes && (
                            <div>
                              <p className="text-xs text-muted-foreground">Supporting Notes</p>
                              <p className={cn(
                                "text-xs",
                                sellerStatus === 'delayed' ? "text-amber-800" : "text-red-800"
                              )}>
                                {statusNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {seller.websiteUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Website</p>
                        <a 
                          href={seller.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline break-all"
                        >
                          {seller.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary Contact</p>
                      <p className="text-sm font-medium">{primaryContact.name}</p>
                      <div className="flex items-center gap-1.5 group/email">
                        <p className="text-xs text-muted-foreground">{primaryContact.email}</p>
                        <button
                          onClick={() => copyToClipboard(primaryContact.email, 'email')}
                          className="opacity-0 group-hover/email:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-opacity"
                          aria-label="Copy email"
                        >
                          {copiedField === 'email' ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {primaryContact.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <div className="flex items-center gap-1.5 group/phone">
                          <p className="text-sm font-medium">{primaryContact.phone}</p>
                          <button
                            onClick={() => copyToClipboard(primaryContact.phone!, 'phone')}
                            className="opacity-0 group-hover/phone:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-opacity"
                            aria-label="Copy phone"
                          >
                            {copiedField === 'phone' ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Company Reg. Number</p>
                      <div className="flex items-center gap-1.5 group/crn">
                        <p className="text-sm font-medium">{seller.crn}</p>
                        <button
                          onClick={() => copyToClipboard(seller.crn, 'crn')}
                          className="opacity-0 group-hover/crn:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-opacity"
                          aria-label="Copy CRN"
                        >
                          {copiedField === 'crn' ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Product Categories</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {seller.primaryProductCategories.map((cat) => (
                          <span key={cat} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Quick Stats */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{sellerNotes.length} notes</span>
                    <span>•</span>
                    <span>{sellerFiles.length} files</span>
                  </div>
                </div>
                
                {/* Notes Preview */}
                <div className="space-y-3">
                  {/* Add Note Input */}
                  <div className="bg-white rounded-lg border">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] border-0 resize-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && newNote.trim()) {
                          e.preventDefault()
                          // Add note logic here
                          setNewNote('')
                        }
                      }}
                    />
                    {newNote.trim() && (
                      <div className="px-3 pb-2 flex justify-end">
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => {
                            // Add note logic here
                            setNewNote('')
                          }}
                        >
                          Add Note
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Recent Notes */}
                  {sellerNotes.length > 0 ? (
                    <div className="space-y-2">
                      {sellerNotes
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((note) => (
                          <div key={note.id} className="bg-white rounded-lg p-3 border">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarFallback className="bg-muted text-[10px]">
                                  {note.authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-0.5">
                                  {note.author} • {formatDate(note.createdAt)}
                                </p>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {note.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {sellerNotes.length > 3 && (
                        <button
                          onClick={() => setActiveTab('notes')}
                          className="w-full text-xs text-blue-600 hover:text-blue-700 py-1"
                        >
                          View all {sellerNotes.length} notes
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No notes yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed State - Show expand icon */
            <div className="flex flex-col items-center py-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsSidebarExpanded(true)}
                    className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="mt-0 h-full">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {sectionOrder.map((sectionId) => {
                        switch (sectionId) {
                          case 'supplier-details':
                            return (
                              <SortableCard key={sectionId} id={sectionId}>
                                <Card className="h-full">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      <CardTitle className="text-base">Supplier Details</CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Country of Registration</p>
                                        <p className="text-sm font-medium">{seller.countryOfRegistration}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">VAT Number</p>
                                        <p className="text-sm font-medium">{seller.vatNumber || '—'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Registered Address</p>
                                      <p className="text-sm font-medium">{formatAddress(seller.registeredAddress)}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </SortableCard>
                            )
                          case 'business-metrics':
                            return (
                              <SortableCard key={sectionId} id={sectionId}>
                                <Card className="h-full">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                                      <CardTitle className="text-base">Business Metrics</CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Expected Products</p>
                                        <p className="text-sm font-medium">
                                          {seller.numberOfProductsExpected !== null 
                                            ? seller.numberOfProductsExpected.toLocaleString()
                                            : '—'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Priority Score</p>
                                        <p className="text-sm font-medium">
                                          {seller.priorityScore !== null ? `${seller.priorityScore.toFixed(1)} / 5.0` : '—'}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">GMV Potential</p>
                                      <Select defaultValue={seller.gmvPotential || undefined}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select GMV potential" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Low</SelectItem>
                                          <SelectItem value="medium">Medium</SelectItem>
                                          <SelectItem value="high">High</SelectItem>
                                          <SelectItem value="very-high">Very High</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>
                              </SortableCard>
                            )
                          case 'contact-details':
                            return (
                              <SortableCard key={sectionId} id={sectionId} isFullWidth>
                                <div className="">
                                  <ContactManagement
                                    companyName={seller.companyName}
                                    crn={seller.crn}
                                    countryOfRegistration={seller.countryOfRegistration}
                                    vatNumber={seller.vatNumber}
                                    registeredAddress={seller.registeredAddress}
                                    createdAt={seller.createdAt}
                                    websiteUrl={seller.websiteUrl}
                                    primaryContact={primaryContact}
                                    additionalContacts={additionalContacts}
                                    onPrimaryContactChange={setPrimaryContact}
                                    onAdditionalContactsChange={setAdditionalContacts}
                                    showLegalIdentity={false}
                                  />
                                </div>
                              </SortableCard>
                            )
                          case 'assignment':
                            return (
                              <SortableCard key={sectionId} id={sectionId}>
                                <Card className="h-full">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <CardTitle className="text-base">Assignment</CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Acquisition Manager</p>
                                      <Select defaultValue={seller.acquisitionManager || undefined}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Not assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {acquisitionManagers.map((manager) => (
                                            <SelectItem key={manager} value={manager}>
                                              {manager}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Onboarding Manager</p>
                                      <Select defaultValue={seller.onboardingManager || undefined}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Not assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {onboardingManagers.map((manager) => (
                                            <SelectItem key={manager} value={manager}>
                                              {manager}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Account Manager</p>
                                      <Select defaultValue={seller.accountManager || undefined}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Not assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {accountManagers.map((manager) => (
                                            <SelectItem key={manager} value={manager}>
                                              {manager}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>
                              </SortableCard>
                            )
                          case 'compliance-checks':
                            return (
                              <SortableCard key={sectionId} id={sectionId}>
                                <Card className="h-full">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Compliance Checks</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      {seller.companiesHousePass ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="text-sm">Companies House Pass</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {seller.dnbPass ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="text-sm">D&B Pass</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </SortableCard>
                            )
                          default:
                            return null
                        }
                      })}

                      {/* Rejection Reason (if applicable) - not draggable */}
                      {seller.rejectionReason && (
                        <div className="lg:col-span-2">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-red-600">Rejection Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                                {seller.rejectionReason}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
            </TabsContent>

              <TabsContent value="checklist" className="mt-0 h-full">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pipeline Progress</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete the checklist items as you progress through each stage
                    </p>
                  </CardHeader>
                  <CardContent>
                    <StageChecklists
                      currentStage={currentStage}
                      currentPipeline={seller.pipeline}
                      checklistProgress={checklistProgress}
                      onItemChange={handleChecklistItemChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-0 h-full">
                <Card>
                  <CardContent className="pt-6">
                    {/* Add New Note */}
                    <div className="space-y-3 mb-6">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button onClick={handleAddNote} size="sm">
                        Add Note
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Notes List */}
                    <div className="space-y-4">
                      {sellerNotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No notes yet. Add the first note above.
                        </p>
                      ) : (
                        sellerNotes
                          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                          .map((note) => (
                            <div key={note.id} className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-muted text-xs">
                                  {note.authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{note.authorName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(note.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{note.content}</p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-0 h-full">
                <Card>
                  <CardContent className="pt-6">
                    {/* Upload Area */}
                    <div
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors mb-6"
                      onClick={() => toast.success('File upload functionality coming soon')}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, XLS up to 10MB</p>
                    </div>

                    {/* Files List */}
                    <div className="space-y-2">
                      {sellerFiles.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No files uploaded yet.
                        </p>
                      ) : (
                        sellerFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            {getFileIcon(file.fileType)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.fileSize)} • Uploaded by {file.uploadedBy} on{' '}
                                {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="management" className="mt-0 h-full overflow-y-auto">
                <div className="space-y-6 p-1">
                  {/* Seller Information Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Seller Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Update editable seller details not covered in the Overview section.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Trading Name</label>
                          <input
                            type="text"
                            defaultValue={seller.companyName}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Business Email</label>
                          <input
                            type="email"
                            defaultValue={seller.primaryContact.email}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Business Phone</label>
                          <input
                            type="tel"
                            defaultValue={seller.primaryContact.phone || ''}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Website URL</label>
                          <input
                            type="url"
                            defaultValue={seller.websiteUrl || ''}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button 
                          onClick={() => toast.success('Seller information updated')}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Divider */}
                  <Separator />

                  {/* Lifecycle Status Section */}
                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                        <AlertCircle className="h-4 w-4" />
                        Seller Lifecycle Status
                      </CardTitle>
                      <p className="text-sm text-amber-700">
                        Manage the seller&apos;s lifecycle status. These actions require confirmation and cannot be easily undone.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Status Display */}
                      <div className="rounded-lg border border-amber-200 bg-white p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Status</p>
                        <div className="flex items-center gap-2">
                          {sellerStatus === 'active' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </span>
                          )}
                          {sellerStatus === 'delayed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                              <Clock className="h-3.5 w-3.5" />
                              Delayed
                            </span>
                          )}
                          {sellerStatus === 'terminated' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                              <Ban className="h-3.5 w-3.5" />
                              Terminated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Change Options - only show if not terminated */}
                      {sellerStatus !== 'terminated' && (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-amber-800">Change Status To:</p>
                        
                        {/* Delayed Option - only show if currently active */}
                        {sellerStatus === 'active' && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-amber-100">
                              <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Mark as Delayed</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Temporarily pause the seller&apos;s onboarding process. The seller can be reactivated later.
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pl-11">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Reason <span className="text-red-500">*</span></label>
                              <Select value={delayedReason} onValueChange={setDelayedReason}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="awaiting-documents">Awaiting documents from seller</SelectItem>
                                  <SelectItem value="compliance-review">Pending compliance review</SelectItem>
                                  <SelectItem value="seller-request">Requested by seller</SelectItem>
                                  <SelectItem value="internal-review">Internal review required</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Supporting Notes <span className="text-red-500">*</span></label>
                              <Textarea 
                                placeholder="Provide details about why this seller is being delayed..."
                                className="min-h-[80px]"
                                value={delayedNotes}
                                onChange={(e) => setDelayedNotes(e.target.value)}
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              disabled={!delayedReason || !delayedNotes.trim()}
                              onClick={() => {
                                setSellerStatus('delayed')
                                setStatusReason(delayedReason)
                                setStatusNotes(delayedNotes)
                                toast.success('Seller marked as delayed')
                                setDelayedReason('')
                                setDelayedNotes('')
                              }}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Delayed
                            </Button>
                          </div>
                        </div>
                        )}

                        {/* Terminated Option */}
                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-red-100">
                              <Ban className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Mark as Terminated</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Permanently end the seller relationship. This action should only be used when the partnership cannot continue.
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pl-11">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Reason <span className="text-red-500">*</span></label>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="compliance-failure">Failed compliance requirements</SelectItem>
                                  <SelectItem value="seller-withdrew">Seller withdrew application</SelectItem>
                                  <SelectItem value="business-closed">Business closed</SelectItem>
                                  <SelectItem value="duplicate">Duplicate entry</SelectItem>
                                  <SelectItem value="fraud">Suspected fraud</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Supporting Notes <span className="text-red-500">*</span></label>
                              <Textarea 
                                placeholder="Provide details about why this seller is being terminated..."
                                className="min-h-[80px]"
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              className="border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => setShowTerminateDialog(true)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Mark as Terminated
                            </Button>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Warning Notice */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600">
                          Seller deletion is not permitted. If you need to remove a seller record, please contact your system administrator.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </div>

        {/* Incomplete Checklist Dialog */}
        <IncompleteChecklistDialog
          open={showIncompleteDialog}
          onOpenChange={setShowIncompleteDialog}
          incompleteItems={incompleteItems}
          onConfirm={handleConfirmIncompleteMove}
        />

        {/* Terminate Confirmation Dialog */}
        <Dialog open={showTerminateDialog} onOpenChange={(open) => {
          setShowTerminateDialog(open)
          if (!open) setTerminateConfirmText('')
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700 flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Confirm Termination
              </DialogTitle>
              <DialogDescription>
                This action will permanently terminate the seller relationship with <span className="font-semibold">{seller.companyName}</span>. This cannot be easily undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                To confirm, please type <span className="font-mono font-semibold text-red-600">terminate</span> below:
              </p>
              <Input
                value={terminateConfirmText}
                onChange={(e) => setTerminateConfirmText(e.target.value)}
                placeholder="Type 'terminate' to confirm"
                className="font-mono"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTerminateDialog(false)
                  setTerminateConfirmText('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={terminateConfirmText.toLowerCase() !== 'terminate'}
                onClick={() => {
                  setSellerStatus('terminated')
                  setStatusReason(terminateReason)
                  setStatusNotes(terminateNotes)
                  toast.success('Seller has been terminated')
                  setShowTerminateDialog(false)
                  setTerminateConfirmText('')
                  setTerminateReason('')
                  setTerminateNotes('')
                }}
              >
                Terminate Seller
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </TooltipProvider>
  )
}
