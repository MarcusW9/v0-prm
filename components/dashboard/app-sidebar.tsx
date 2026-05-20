'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Columns3,
  UsersRound,
  Settings,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const navigation = {
  overview: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ],
  partnerManagement: [
    { name: 'All Partners', href: '/dashboard/partners', icon: Users },
  ],
  admin: [
    { name: 'Team', href: '/dashboard/team', icon: UsersRound },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
}

const pipelineViews = [
  { name: 'Acquisition', value: 'acquisition' },
  { name: 'Onboarding', value: 'onboarding' },
  { name: 'Account Management', value: 'account-management' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [pipelineOpen, setPipelineOpen] = useState(pathname.startsWith('/dashboard/pipeline'))

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isPipelineActive = pathname.startsWith('/dashboard/pipeline')

  const handlePipelineNavigation = (view: string) => {
    router.push(`/dashboard/pipeline?view=${view}`)
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-slate-800 px-2 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-orange-500">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-white">Argos</span>
            <span className="text-xs text-slate-400">Partner Hub</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-slate-800">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.overview.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      'text-slate-300 hover:bg-slate-700 hover:text-white',
                      isActive(item.href) && 'bg-slate-700 text-white'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Partner Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.partnerManagement.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      'text-slate-300 hover:bg-slate-700 hover:text-white',
                      isActive(item.href) && 'bg-slate-700 text-white'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Pipeline with expandable sub-menu */}
              <Collapsible open={pipelineOpen} onOpenChange={setPipelineOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        'text-slate-300 hover:bg-slate-700 hover:text-white w-full',
                        isPipelineActive && 'bg-slate-700 text-white'
                      )}
                    >
                      <Columns3 className="h-4 w-4" />
                      <span className="flex-1">Pipeline</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        pipelineOpen && "rotate-180"
                      )} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {pipelineViews.map((view) => (
                        <SidebarMenuSubItem key={view.value}>
                          <SidebarMenuSubButton
                            onClick={() => handlePipelineNavigation(view.value)}
                            className="text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer"
                          >
                            <span>{view.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.admin.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      'text-slate-300 hover:bg-slate-700 hover:text-white',
                      isActive(item.href) && 'bg-slate-700 text-white'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-slate-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left hover:bg-slate-700">
              <Avatar className="h-8 w-8 flex-shrink-0 bg-teal-600">
                <AvatarFallback className="bg-teal-600 text-xs text-white">
                  T
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-white">test</span>
                <span className="text-xs text-slate-400">admin</span>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
