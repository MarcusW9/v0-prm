'use client'

import type { Seller } from '@/lib/types/seller'
import { User, Mail, Building2, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface PartnerOverviewProps {
  seller: Seller
}

export function PartnerOverview({ seller }: PartnerOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-900">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            <span>{seller.contactName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{seller.contactEmail}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">CRN: {seller.crn}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              Added {seller.createdAt.toLocaleDateString('en-GB')}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Assignment */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-900">Assignment</h4>
        <div className="space-y-2">
          <Label htmlFor="sam-manager" className="text-xs text-slate-500">
            SAM Manager
          </Label>
          <div className="text-sm">{seller.samManager}</div>
        </div>
      </div>

      <Separator />

      {/* GMV Potential */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-900">Business Assessment</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="gmv-potential" className="text-xs text-slate-500">
              GMV Potential
            </Label>
            <Select defaultValue={seller.gmvPotential || undefined}>
              <SelectTrigger id="gmv-potential" className="mt-1">
                <SelectValue placeholder="Select GMV potential" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very-high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {seller.priorityScore !== null && (
            <div>
              <Label className="text-xs text-slate-500">Priority Score</Label>
              <div className="mt-1 text-sm font-medium">
                {seller.priorityScore.toFixed(1)} / 5.0
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Compliance Checks */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-900">Compliance Checks</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {seller.companiesHousePass ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-slate-300" />
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="companies-house"
                checked={seller.companiesHousePass}
              />
              <Label htmlFor="companies-house" className="text-sm cursor-pointer">
                Companies House Pass
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {seller.dnbPass ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-slate-300" />
            )}
            <div className="flex items-center gap-2">
              <Checkbox id="dnb" checked={seller.dnbPass} />
              <Label htmlFor="dnb" className="text-sm cursor-pointer">
                D&B Pass
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason (if applicable) */}
      {seller.rejectionReason && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900">Rejection Reason</h4>
            <Textarea
              value={seller.rejectionReason}
              readOnly
              className="resize-none bg-red-50 text-red-700 border-red-200"
              rows={2}
            />
          </div>
        </>
      )}

      {/* Miraki Link Status */}
      <Separator />
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-900">Integration Status</h4>
        <div className="flex items-center gap-2 text-sm">
          {seller.mirakiLinked ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600">Linked to Miraki</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-slate-300" />
              <span className="text-slate-500">Not linked to Miraki</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
