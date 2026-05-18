'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'acquisition', label: 'Acquisition Pipeline', href: '/dashboard/pipeline' },
  { id: 'onboarding', label: 'Onboarding Pipeline', href: '/dashboard/onboarding' },
  { id: 'account-management', label: 'Account Management', href: '/dashboard/account-management' },
]

export function PipelineTabs() {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === '/dashboard/onboarding') return 'onboarding'
    if (pathname === '/dashboard/account-management') return 'account-management'
    return 'acquisition'
  }

  const activeTab = getActiveTab()

  return (
    <div className="border-b bg-white">
      <div className="flex gap-6 px-6">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'relative py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
