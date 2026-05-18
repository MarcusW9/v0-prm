'use client'

import { useState } from 'react'
import type { Note } from '@/lib/types/seller'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface PartnerNotesProps {
  notes: Note[]
  sellerId: string
}

export function PartnerNotes({ notes, sellerId }: PartnerNotesProps) {
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }
    toast.success('Note added successfully')
    setNewNote('')
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

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <div className="space-y-3">
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

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet. Add the first note above.
          </p>
        ) : (
          notes
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((note) => (
              <div key={note.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-slate-200 text-xs">
                    {note.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{note.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{note.content}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
