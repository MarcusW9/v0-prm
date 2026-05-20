'use client'

import { useState } from 'react'
import { User, Mail, Phone, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
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

interface ContactCardProps {
  contact: Contact
  isPrimary?: boolean
  onEdit: () => void
  onDelete?: () => void
}

function ContactCard({ contact, isPrimary, onEdit, onDelete }: ContactCardProps) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      isPrimary ? "border-blue-200 bg-blue-50/50" : "bg-white"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{contact.name}</span>
          <Badge variant="secondary" className={cn("text-xs", getRoleBadgeColor(contact.role))}>
            {getRoleLabel(contact.role)}
          </Badge>
          {isPrimary && (
            <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
              Primary
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <a href={`mailto:${contact.email}`} className="hover:text-foreground hover:underline">
            {contact.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <a href={`tel:${contact.phone}`} className="hover:text-foreground hover:underline">
            {contact.phone}
          </a>
        </div>
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
  primaryContact,
  additionalContacts,
  onPrimaryContactChange,
  onAdditionalContactsChange,
}: ContactManagementProps) {
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(additionalContacts.length > 0)
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

  const technicalContact = additionalContacts.find(c => c.role === 'technical')

  return (
    <div className="space-y-4">
      {/* Primary Contact - Always visible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Primary Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactCard
            contact={primaryContact}
            isPrimary
            onEdit={handleEditPrimary}
          />
        </CardContent>
      </Card>

      {/* Additional Contacts - Collapsible */}
      <Collapsible open={isAdditionalOpen} onOpenChange={setIsAdditionalOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Additional Contacts
                  {additionalContacts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {additionalContacts.length}
                    </Badge>
                  )}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {isAdditionalOpen ? 'Click to collapse' : 'Click to expand'}
                </span>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {additionalContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No additional contacts yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {additionalContacts.map((contact) => (
                    <ContactCard
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
                className="w-full mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Technical Contact Highlight (if exists) */}
      {technicalContact && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-purple-700">
              Technical Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">{technicalContact.name}</p>
              <p className="text-muted-foreground">{technicalContact.email}</p>
              <p className="text-muted-foreground">{technicalContact.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
