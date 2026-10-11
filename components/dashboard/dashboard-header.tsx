'use client'

import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

export function DashboardHeader() {
  const { toggleSidebar, open } = useSidebar()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8"
      >
        {open ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeft className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <span className="text-sm text-muted-foreground">PartnerOps Hub</span>
    </header>
  )
}
