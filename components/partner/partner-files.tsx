'use client'

import type { SellerFile } from '@/lib/types/seller'
import { FileText, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PartnerFilesProps {
  files: SellerFile[]
  sellerId: string
}

export function PartnerFiles({ files }: PartnerFilesProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
    }
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  const handleUpload = () => {
    toast.success('File upload functionality coming soon')
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer hover:border-slate-300 transition-colors"
        onClick={handleUpload}
      >
        <Upload className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOC, XLS up to 10MB
        </p>
      </div>

      {/* Files List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No files uploaded yet.
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
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
    </div>
  )
}
