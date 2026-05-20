'use client'

import { useState } from 'react'
import { User, Mail, Phone, Plus, Pencil, Trash2, Building2, Calendar, ChevronDown, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Contact, ContactRole } from '@/lib/types/seller'
import { contactRoleOptions } from '@/lib/data/mock-sellers'

interface ContactManagementProps {
  companyName: string
  crn: string
  createdAt: Date
  primaryContact: Contact
  additionalContacts: Contact[]
  onPrimaryContactChange?: (contact: Contact) => void
  onAdditionalContactsChange?: (contacts: Contact[]) => void
}

const getRoleBadgeColor = (role: ContactRole) => {
  switch (role) {
    case 'account':
    case 'commercial':
      return 'bg-blue-100 text-blue-700'
    case 'technical':
      return 'bg-purple-100 text-purple-700'
    case 'operations':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const getRoleLabel = (role: ContactRole) => {
  const option = contactRoleOptions.find(o => o.value === role)
  return option?.label || role
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

interface ContactRowProps {
  contact: Contact
  isPrimary?: boolean
  onEdit: () => void
  onDelete?: () => void
}

function ContactRow({ contact, isPrimary, onEdit, onDelete }: ContactRowProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 rounded-lg",
      isPrimary ? "bg-slate-50" : "bg-white border"
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-200 text-slate-600 text-sm font-medium">
          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{contact.name}</span>
            <Badge variant="secondary" className={cn("text-xs", getRoleBadgeColor(contact.role))}>
              {getRoleLabel(contact.role)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {contact.email}
              <button
                onClick={() => copyToClipboard(contact.email, 'Email')}
                className="ml-1 hover:text-foreground transition-colors"
                title="Copy email"
              >
                <Copy className="h-3 w-3" />
              </button>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {contact.phone}
              <button
                onClick={() => copyToClipboard(contact.phone, 'Phone')}
                className="ml-1 hover:text-foreground transition-colors"
                title="Copy phone"
              >
                <Copy className="h-3 w-3" />
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        {onDelete && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
  onSave: (contact: Omit<Contact, 'id'>) => void
  title: string
}

function ContactDialog({ open, onOpenChange, contact, onSave, title }: ContactDialogProps) {
  const [name, setName] = useState(contact?.name || '')
  const [email, setEmail] = useState(contact?.email || '')
  const [phone, setPhone] = useState(contact?.phone || '')
  const [role, setRole] = useState<ContactRole>(contact?.role || 'account')

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    onSave({ name, email, phone, role })
    onOpenChange(false)
    setName('')
    setEmail('')
    setPhone('')
    setRole('account')
  }

  // Reset form when contact changes
  useState(() => {
    if (contact) {
      setName(contact.name)
      setEmail(contact.email)
      setPhone(contact.phone)
      setRole(contact.role)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the contact details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 900000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(val) => setRole(val as ContactRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contactRoleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ContactManagement({
  companyName,
  crn,
  createdAt,
  primaryContact,
  additionalContacts,
  onPrimaryContactChange,
  onAdditionalContactsChange,
}: ContactManagementProps) {
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPrimary, setEditingPrimary] = useState(false)

  const handleEditPrimary = () => {
    setEditingContact(primaryContact)
    setEditingPrimary(true)
    setIsEditDialogOpen(true)
  }

  const handleEditAdditional = (contact: Contact) => {
    setEditingContact(contact)
    setEditingPrimary(false)
    setIsEditDialogOpen(true)
  }

  const handleDeleteAdditional = (contactId: string) => {
    const updated = additionalContacts.filter(c => c.id !== contactId)
    onAdditionalContactsChange?.(updated)
    toast.success('Contact removed')
  }

  const handleSaveEdit = (data: Omit<Contact, 'id'>) => {
    if (editingPrimary && editingContact) {
      onPrimaryContactChange?.({ ...editingContact, ...data })
      toast.success('Primary contact updated')
    } else if (editingContact) {
      const updated = additionalContacts.map(c =>
        c.id === editingContact.id ? { ...c, ...data } : c
      )
      onAdditionalContactsChange?.(updated)
      toast.success('Contact updated')
    }
    setEditingContact(null)
    setIsEditDialogOpen(false)
  }

  const handleAddContact = (data: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...data,
      id: `new-${Date.now()}`,
    }
    onAdditionalContactsChange?.([...additionalContacts, newContact])
    toast.success('Contact added')
    setIsAddDialogOpen(false)
    setIsAdditionalOpen(true)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Details */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>CRN: {crn}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Added {formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Primary Contact - Always visible */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Contact</h4>
          <ContactRow
            contact={primaryContact}
            isPrimary
            onEdit={handleEditPrimary}
          />
        </div>

        {/* Additional Contacts - Collapsible */}
        <Collapsible open={isAdditionalOpen} onOpenChange={setIsAdditionalOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                Additional Contacts
                {additionalContacts.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100">
                    {additionalContacts.length}
                  </Badge>
                )}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isAdditionalOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {additionalContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-slate-50">
                No additional contacts yet.
              </p>
            ) : (
              <div className="space-y-2">
                {additionalContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onEdit={() => handleEditAdditional(contact)}
                    onDelete={() => handleDeleteAdditional(contact.id)}
                  />
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {/* Edit Dialog */}
      <ContactDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contact={editingContact || undefined}
        onSave={handleSaveEdit}
        title={editingPrimary ? 'Edit Primary Contact' : 'Edit Contact'}
      />

      {/* Add Dialog */}
      <ContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddContact}
        title="Add New Contact"
      />
    </Card>
  )
}
