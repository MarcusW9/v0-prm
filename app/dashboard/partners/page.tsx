import { PartnersTable } from '@/components/partners-table/partners-table'
import { mockSellers } from '@/lib/data/mock-sellers'

export default function PartnersPage() {
  return (
    <div className="p-6">
      <PartnersTable sellers={mockSellers} />
    </div>
  )
}
