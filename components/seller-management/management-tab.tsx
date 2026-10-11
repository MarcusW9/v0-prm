'use client'

import { useState } from 'react'
import type { Seller, SellerStatus, DelayedReason, TerminatedReason } from '@/lib/types/seller'
import { delayedReasons, terminatedReasons, samManagers } from '@/lib/data/mock-sellers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AlertTriangle, Clock, XOctagon, CheckCircle2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ManagementTabProps {
  seller: Seller
  onSellerUpdate?: (updatedSeller: Seller) => void
}

export function ManagementTab({ seller, onSellerUpdate }: ManagementTabProps) {
  // Editable fields state
  const [contactName, setContactName] = useState(seller.contactName)
  const [contactEmail, setContactEmail] = useState(seller.contactEmail)
  const [samManager, setSamManager] = useState(seller.samManager)
  const [hasChanges, setHasChanges] = useState(false)

  // Status change state
  const [selectedStatus, setSelectedStatus] = useState<SellerStatus | null>(null)
  const [statusReason, setStatusReason] = useState<string>('')
  const [statusNotes, setStatusNotes] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleFieldChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value)
    setHasChanges(true)
  }

  const handleSaveChanges = () => {
    if (onSellerUpdate) {
      onSellerUpdate({
        ...seller,
        contactName,
        contactEmail,
        samManager,
        updatedAt: new Date(),
      })
    }
    toast.success('Seller information updated successfully')
    setHasChanges(false)
  }

  const handleStatusChange = (newStatus: SellerStatus) => {
    setSelectedStatus(newStatus)
    setStatusReason('')
    setStatusNotes('')
  }

  const handleConfirmStatusChange = () => {
    if (!selectedStatus || !statusReason || !statusNotes.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (onSellerUpdate) {
      const newStatusRecord = {
        id: `sh-${Date.now()}`,
        status: selectedStatus,
        reason: statusReason as DelayedReason | TerminatedReason,
        notes: statusNotes,
        changedBy: 'Current User', // In real app, this would come from auth
        changedAt: new Date(),
      }

      onSellerUpdate({
        ...seller,
        status: selectedStatus,
        statusReason: statusReason as DelayedReason | TerminatedReason,
        statusNotes,
        statusChangedAt: new Date(),
        statusChangedBy: 'Current User',
        statusHistory: [...seller.statusHistory, newStatusRecord],
        updatedAt: new Date(),
      })
    }

    toast.success(`Seller status changed to ${selectedStatus}`)
    setShowConfirmDialog(false)
    setSelectedStatus(null)
    setStatusReason('')
    setStatusNotes('')
  }

  const canProceedWithStatusChange = selectedStatus && statusReason && statusNotes.trim()

  const getStatusBadge = (status: SellerStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'delayed':
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0">
            <Clock className="mr-1 h-3 w-3" />
            Delayed
          </Badge>
        )
      case 'terminated':
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-0">
            <XOctagon className="mr-1 h-3 w-3" />
            Terminated
          </Badge>
        )
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getReasonLabel = (reason: string | null, status: SellerStatus) => {
    if (!reason) return null
    const reasons = status === 'delayed' ? delayedReasons : terminatedReasons
    return reasons.find((r) => r.value === reason)?.label || reason
  }

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      {seller.status !== 'active' && (
        <Card className={cn(
          'border-l-4',
          seller.status === 'delayed' ? 'border-l-amber-500 bg-amber-50/50' : 'border-l-red-500 bg-red-50/50'
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Status</CardTitle>
              {getStatusBadge(seller.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {seller.statusReason && (
              <p>
                <span className="font-medium">Reason:</span>{' '}
                {getReasonLabel(seller.statusReason, seller.status)}
              </p>
            )}
            {seller.statusNotes && (
              <p>
                <span className="font-medium">Notes:</span> {seller.statusNotes}
              </p>
            )}
            {seller.statusChangedAt && seller.statusChangedBy && (
              <p className="text-muted-foreground">
                Changed by {seller.statusChangedBy} on {formatDate(seller.statusChangedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editable Seller Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seller Information</CardTitle>
          <CardDescription>
            Update contact details and assignment information for this seller.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => handleFieldChange(setContactName, e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => handleFieldChange(setContactEmail, e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="samManager">SAM Manager</Label>
            <Select
              value={samManager}
              onValueChange={(value) => handleFieldChange(setSamManager, value)}
            >
              <SelectTrigger id="samManager">
                <SelectValue placeholder="Select SAM Manager" />
              </SelectTrigger>
              <SelectContent>
                {samManagers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveChanges} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifecycle Actions - Visually Separated and De-emphasized */}
      <div className="pt-4">
        <Separator className="mb-6" />
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lifecycle-actions" className="border rounded-lg bg-muted/30">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Lifecycle Status Actions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These actions affect the seller&apos;s lifecycle status. Changes are recorded and cannot be easily undone.
                </p>

                {seller.status === 'active' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Delay Action */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-amber-100 p-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-medium">Mark as Delayed</h4>
                            <p className="text-xs text-muted-foreground">
                              Temporarily pause this seller&apos;s progress in the pipeline.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleStatusChange('delayed')}
                            >
                              Set to Delayed
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Terminate Action */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-red-100 p-2">
                            <XOctagon className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-medium">Mark as Terminated</h4>
                            <p className="text-xs text-muted-foreground">
                              End this seller&apos;s partnership journey.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange('terminated')}
                            >
                              Set to Terminated
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {seller.status === 'delayed' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Reactivate */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-100 p-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-medium">Reactivate Seller</h4>
                            <p className="text-xs text-muted-foreground">
                              Resume this seller&apos;s progress in the pipeline.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleStatusChange('active')}
                            >
                              Set to Active
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Terminate */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-red-100 p-2">
                            <XOctagon className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-medium">Mark as Terminated</h4>
                            <p className="text-xs text-muted-foreground">
                              End this seller&apos;s partnership journey.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange('terminated')}
                            >
                              Set to Terminated
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {seller.status === 'terminated' && (
                  <Card className="border-dashed">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="text-sm font-medium">Reactivate Seller</h4>
                          <p className="text-xs text-muted-foreground">
                            Resume this seller&apos;s progress in the pipeline.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleStatusChange('active')}
                          >
                            Set to Active
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status History */}
                {seller.statusHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Status History</h4>
                    <div className="space-y-2">
                      {seller.statusHistory
                        .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())
                        .map((record) => (
                          <div
                            key={record.id}
                            className="flex items-start gap-3 text-sm p-3 rounded-lg bg-background border"
                          >
                            {getStatusBadge(record.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground">
                                {getReasonLabel(record.reason, record.status)}
                              </p>
                              {record.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {record.notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                By {record.changedBy} on {formatDate(record.changedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Status Change Form Dialog */}
      {selectedStatus && selectedStatus !== 'active' && (
        <Card className="border-2 border-dashed mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {selectedStatus === 'delayed' ? (
                <>
                  <Clock className="h-4 w-4 text-amber-600" />
                  Set Seller to Delayed
                </>
              ) : (
                <>
                  <XOctagon className="h-4 w-4 text-red-600" />
                  Set Seller to Terminated
                </>
              )}
            </CardTitle>
            <CardDescription>
              Please provide a reason and supporting notes for this status change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={statusReason} onValueChange={setStatusReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedStatus === 'delayed' ? delayedReasons : terminatedReasons).map(
                    (reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Supporting Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Provide additional context for this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatus(null)
                  setStatusReason('')
                  setStatusNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant={selectedStatus === 'terminated' ? 'destructive' : 'default'}
                onClick={() => setShowConfirmDialog(true)}
                disabled={!canProceedWithStatusChange}
              >
                Confirm Status Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reactivation Form */}
      {selectedStatus === 'active' && (
        <Card className="border-2 border-dashed mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Reactivate Seller
            </CardTitle>
            <CardDescription>
              Please provide a reason and supporting notes for reactivating this seller.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reactivate-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={statusReason} onValueChange={setStatusReason}>
                <SelectTrigger id="reactivate-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issue-resolved">Issue Resolved</SelectItem>
                  <SelectItem value="seller-responded">Seller Responded</SelectItem>
                  <SelectItem value="compliance-cleared">Compliance Cleared</SelectItem>
                  <SelectItem value="business-decision">Business Decision</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reactivate-notes">
                Supporting Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reactivate-notes"
                placeholder="Provide additional context for this reactivation..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatus(null)
                  setStatusReason('')
                  setStatusNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!canProceedWithStatusChange}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Reactivation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStatus === 'active'
                ? 'Confirm Seller Reactivation'
                : selectedStatus === 'delayed'
                ? 'Confirm Delay Status'
                : 'Confirm Termination'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus === 'active' ? (
                <>
                  You are about to reactivate <strong>{seller.companyName}</strong>. This will
                  allow the seller to continue progressing through the pipeline.
                </>
              ) : selectedStatus === 'delayed' ? (
                <>
                  You are about to mark <strong>{seller.companyName}</strong> as delayed. This
                  action will be recorded in the seller&apos;s history.
                </>
              ) : (
                <>
                  You are about to terminate <strong>{seller.companyName}</strong>. This is a
                  significant action that will be recorded permanently in the seller&apos;s history.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={cn(
                selectedStatus === 'terminated' && 'bg-red-600 hover:bg-red-700',
                selectedStatus === 'active' && 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {selectedStatus === 'active'
                ? 'Yes, Reactivate'
                : selectedStatus === 'delayed'
                ? 'Yes, Mark as Delayed'
                : 'Yes, Terminate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
