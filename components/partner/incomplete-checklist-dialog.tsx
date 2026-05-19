'use client'

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
import { AlertTriangle } from 'lucide-react'

interface IncompleteChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incompleteItems: string[]
  fromStage: string
  toStage: string
  onConfirm: () => void
}

export function IncompleteChecklistDialog({
  open,
  onOpenChange,
  incompleteItems,
  fromStage,
  toStage,
  onConfirm,
}: IncompleteChecklistDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <AlertDialogTitle>Incomplete Checklist Items</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            You are moving this seller from <strong>{fromStage}</strong> to{' '}
            <strong>{toStage}</strong> with incomplete checklist items.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Missing items ({incompleteItems.length}):
          </p>
          <ul className="space-y-1">
            {incompleteItems.map((item, index) => (
              <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Move Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
