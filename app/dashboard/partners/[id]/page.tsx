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
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Globe,
  Link as LinkIcon,
  Package,
  Tag,
  FileCheck,
  Calendar,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
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

  const formatAddress = (address: typeof seller.registeredAddress) => {
    const parts = [address.line1]
    if (address.line2) parts.push(address.line2)
    parts.push(address.city)
    parts.push(address.postcode)
    return parts.join(', ')
  }

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Left Sidebar - Supplier Details */}
        <div className={cn(
          "flex flex-col border-r bg-slate-50 transition-all duration-300 overflow-hidden",
          isSidebarExpanded ? "w-72" : "w-16"
        )}>
          {/* Header with Company Name */}
          <div className="border-b p-4">
            {isSidebarExpanded ? (
              <div>
                <h2 className="font-semibold text-base truncate">{seller.companyName}</h2>
                <div className="flex items-center gap-2 mt-1">
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
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <span className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded",
                      priorityColors.bg,
                      priorityColors.text
                    )}>
                      {seller.priorityScore !== null ? seller.priorityScore.toFixed(1) : '—'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{seller.companyName}</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Supplier Details - Only when expanded */}
          {isSidebarExpanded && (
            <div className="flex-1 overflow-y-auto">
              {/* Business Details Section */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Details</span>
                </div>
                
                <div className="space-y-3">
                  {seller.websiteUrl && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Website</p>
                        <a 
                          href={seller.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {seller.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Product Categories</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {seller.primaryProductCategories.map((cat) => (
                          <span key={cat} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Products</p>
                      <p className="text-sm font-medium">
                        {seller.numberOfProductsExpected !== null 
                          ? seller.numberOfProductsExpected.toLocaleString()
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Legal Identity Section */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Legal Identity</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company Reg. Number</p>
                      <p className="text-sm font-medium">{seller.crn}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Country of Registration</p>
                      <p className="text-sm font-medium">{seller.countryOfRegistration}</p>
                    </div>
                  </div>
                  
                  {seller.vatNumber && (
                    <div className="flex items-start gap-3">
                      <FileCheck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">VAT Number</p>
                        <p className="text-sm font-medium">{seller.vatNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Registered Address</p>
                      <p className="text-sm font-medium">{formatAddress(seller.registeredAddress)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Added to System</p>
                      <p className="text-sm font-medium">{formatDate(seller.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assignment Section */}
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Assignment</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Acquisition Manager</p>
                    <Select defaultValue={seller.acquisitionManager || undefined}>
                      <SelectTrigger className="w-full h-8 text-sm">
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
                      <SelectTrigger className="w-full h-8 text-sm">
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
                      <SelectTrigger className="w-full h-8 text-sm">
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
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Activity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-semibold">{sellerNotes.length}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-semibold">{sellerFiles.length}</p>
                    <p className="text-xs text-muted-foreground">Files</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapse/Expand Toggle */}
          <div className="border-t p-2 mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  {isSidebarExpanded ? (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Collapse</span>
                    </>
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              {!isSidebarExpanded && (
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Single Top Bar with Back, Tabs, and Stage */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b bg-background px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border mx-1" />
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
                </TabsList>
              </div>
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
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview" className="mt-0 h-full">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Contacts - Full width */}
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
                      showLegalIdentity={false}
                    />
                  </div>

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
            </div>
          </Tabs>
        </div>

        {/* Incomplete Checklist Dialog */}
        <IncompleteChecklistDialog
          open={showIncompleteDialog}
          onOpenChange={setShowIncompleteDialog}
          incompleteItems={incompleteItems}
          onConfirm={handleConfirmIncompleteMove}
        />
      </div>
    </TooltipProvider>
  )
}
