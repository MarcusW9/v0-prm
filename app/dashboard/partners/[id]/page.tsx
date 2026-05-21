'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockSellers, mockNotes, mockFiles, acquisitionManagers, onboardingManagers, accountManagers } from '@/lib/data/mock-sellers'
import { getStageDefinition, acquisitionStages } from '@/lib/data/pipeline-stages'
import { getPriorityColor } from '@/lib/data/pipeline-stages'
import { getChecklistForStage } from '@/lib/data/stage-checklists'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  FileText, 
  FileSpreadsheet,
  LayoutDashboard,
  ClipboardList,
  StickyNote,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { StageChecklists, hasIncompleteItems } from '@/components/partner/stage-checklists'
import { IncompleteChecklistDialog } from '@/components/partner/incomplete-checklist-dialog'
import { ContactManagement } from '@/components/partner/contact-management'
import type { AcquisitionStage, ChecklistItemCompletion, Contact } from '@/lib/types/seller'

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'files', label: 'Files', icon: FolderOpen },
]

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [newNote, setNewNote] = useState('')
  
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

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Left Panel - Seller Identity & Navigation */}
        <div 
          className={cn(
            "flex flex-col border-r bg-slate-50 transition-all duration-300",
            leftPanelCollapsed ? "w-16" : "w-72"
          )}
        >
          {/* Back Button & Collapse Toggle */}
          <div className="flex items-center justify-between p-3 border-b bg-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Back to list</TooltipContent>
            </Tooltip>
            {!leftPanelCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelCollapsed(true)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {leftPanelCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelCollapsed(false)}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand panel</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Seller Identity Card */}
          <div className={cn(
            "p-4 border-b bg-white",
            leftPanelCollapsed && "flex justify-center"
          )}>
            {leftPanelCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-700 text-white font-semibold text-sm cursor-default">
                    {seller.companyName.slice(0, 2).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{seller.companyName}</p>
                    <p className="text-xs opacity-80">CRN: {seller.crn}</p>
                    {stageDefinition && (
                      <p className="text-xs opacity-80">{stageDefinition.label}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-700 text-white font-semibold text-base flex-shrink-0">
                    {seller.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-base truncate">{seller.companyName}</h2>
                    <p className="text-xs text-muted-foreground">CRN: {seller.crn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {seller.priorityScore !== null && (
                    <span
                      className={cn(
                        'flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-semibold px-2',
                        priorityColors.bg,
                        priorityColors.text
                      )}
                    >
                      {seller.priorityScore.toFixed(1)}
                    </span>
                  )}
                  {stageDefinition && (
                    <Badge
                      variant="secondary"
                      className={cn(stageDefinition.bgColor, stageDefinition.color, 'border-0 text-xs')}
                    >
                      {stageDefinition.label}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{seller.countryOfRegistration}</span>
                </div>

                {/* Stage Selector */}
                <Select value={currentStage} onValueChange={(val) => handleStageChange(val as AcquisitionStage)}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {acquisitionStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id} className="text-xs">
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                const notesCount = item.id === 'notes' ? sellerNotes.length : 0
                const filesCount = item.id === 'files' ? sellerFiles.length : 0
                const count = notesCount || filesCount || 0

                if (leftPanelCollapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "flex items-center justify-center w-full h-10 rounded-md transition-colors",
                            isActive 
                              ? "bg-slate-200 text-slate-900" 
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label} {count > 0 && `(${count})`}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-slate-200 text-slate-900 font-medium" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Right Panel - Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Overview</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Company Information with Contacts - Full width */}
                  <div className="lg:col-span-2">
                    <ContactManagement
                      companyName={seller.companyName}
                      crn={seller.crn}
                      countryOfRegistration={seller.countryOfRegistration}
                      vatNumber={seller.vatNumber}
                      registeredAddress={seller.registeredAddress}
                      createdAt={seller.createdAt}
                      primaryContact={primaryContact}
                      additionalContacts={additionalContacts}
                      onPrimaryContactChange={setPrimaryContact}
                      onAdditionalContactsChange={setAdditionalContacts}
                    />
                  </div>

                  {/* Assignment */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Assignment</CardTitle>
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

                  {/* Business Assessment */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Business Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      {seller.priorityScore !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Priority Score</p>
                          <p className="text-sm font-medium">{seller.priorityScore.toFixed(1)} / 5.0</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Compliance Checks */}
                  <Card>
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

                  {/* Rejection Reason (if applicable) */}
                  {seller.rejectionReason && (
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-red-600">Rejection Reason</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                          {seller.rejectionReason}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Pipeline Progress</h2>
                  <p className="text-sm text-muted-foreground">
                    Complete the checklist items as you progress through each stage
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <StageChecklists
                      currentStage={currentStage}
                      currentPipeline={seller.pipeline}
                      checklistProgress={checklistProgress}
                      onItemChange={handleChecklistItemChange}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notes</h2>
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
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Files</h2>
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
              </div>
            )}
          </div>
        </div>

        {/* Incomplete Checklist Dialog */}
        <IncompleteChecklistDialog
          open={showIncompleteDialog}
          onOpenChange={setShowIncompleteDialog}
          incompleteItems={incompleteItems}
          currentStage={getStageDefinition(currentStage)?.label || currentStage}
          targetStage={getStageDefinition(pendingStageChange || currentStage)?.label || pendingStageChange || ''}
          onConfirm={handleConfirmIncompleteMove}
          onCancel={() => setShowIncompleteDialog(false)}
        />
      </div>
    </TooltipProvider>
  )
}
