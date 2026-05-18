'use client'

import { useState } from 'react'
import type { Seller } from '@/lib/types/seller'
import { getStageDefinition } from '@/lib/data/pipeline-stages'
import { mockNotes, mockFiles } from '@/lib/data/mock-sellers'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PartnerOverview } from './partner-overview'
import { PartnerNotes } from './partner-notes'
import { PartnerFiles } from './partner-files'

interface PartnerSheetProps {
  seller: Seller | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartnerSheet({ seller, open, onOpenChange }: PartnerSheetProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!seller) return null

  const stageDefinition = getStageDefinition(seller.stage)
  const sellerNotes = mockNotes.filter((note) => note.sellerId === seller.id)
  const sellerFiles = mockFiles.filter((file) => file.sellerId === seller.id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-lg">{seller.companyName}</SheetTitle>
              <p className="text-sm text-muted-foreground">CRN: {seller.crn}</p>
            </div>
            {stageDefinition && (
              <Badge
                variant="secondary"
                className={`${stageDefinition.bgColor} ${stageDefinition.color} border-0`}
              >
                {stageDefinition.label}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">
              Notes {sellerNotes.length > 0 && `(${sellerNotes.length})`}
            </TabsTrigger>
            <TabsTrigger value="files">
              Files {sellerFiles.length > 0 && `(${sellerFiles.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <PartnerOverview seller={seller} />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <PartnerNotes notes={sellerNotes} sellerId={seller.id} />
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <PartnerFiles files={sellerFiles} sellerId={seller.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
