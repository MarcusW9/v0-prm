export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'no-score'

export type AcquisitionStage =
  | 'initial-contact'
  | 'recruiting'
  | 'unresponsive'
  | 'handed-off'
  | 'on-hold'
  | 'pending-approval'
  | 'approved'

export type OnboardingStage =
  | 'shop-created'
  | 'initial-qc-pass'
  | 'qc-reject'
  | 'launch-upload'
  | 'sign-off'
  | 'hypercare'

export type AccountManagementStage =
  | 'stabilisation'
  | 'growing'
  | 'strategic'
  | 'performance-intervention'

export type PipelineStage = AcquisitionStage | OnboardingStage | AccountManagementStage

export type PipelineType = 'acquisition' | 'onboarding' | 'account-management'

export type SellerStatus = 'active' | 'delayed' | 'terminated'

export type DelayedReason = 
  | 'awaiting-seller-response'
  | 'compliance-review'
  | 'internal-capacity'
  | 'seasonal-timing'
  | 'other'

export type TerminatedReason = 
  | 'seller-withdrew'
  | 'compliance-failure'
  | 'business-decision'
  | 'duplicate-application'
  | 'fraudulent-activity'
  | 'other'

export interface StatusChangeRecord {
  id: string
  status: SellerStatus
  reason: DelayedReason | TerminatedReason | null
  notes: string
  changedBy: string
  changedAt: Date
}

export interface Seller {
  id: string
  companyName: string
  crn: string // Company Registration Number
  contactName: string
  contactEmail: string
  priorityScore: number | null // 1.0 - 5.0 scale, null for no score
  pipeline: PipelineType
  stage: PipelineStage
  samManager: string
  daysIdle: number
  gmvPotential: 'low' | 'medium' | 'high' | 'very-high' | null
  companiesHousePass: boolean
  dnbPass: boolean // Dun & Bradstreet
  rejectionReason: string | null
  mirakiLinked: boolean
  healthStatus: 'healthy' | 'at-risk' | 'critical' | null
  status: SellerStatus
  statusReason: DelayedReason | TerminatedReason | null
  statusNotes: string | null
  statusChangedAt: Date | null
  statusChangedBy: string | null
  statusHistory: StatusChangeRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  sellerId: string
  authorName: string
  authorInitials: string
  content: string
  createdAt: Date
}

export interface SellerFile {
  id: string
  sellerId: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: Date
}

export interface StageDefinition {
  id: PipelineStage
  label: string
  color: string
  bgColor: string
}

export interface PipelineDefinition {
  id: PipelineType
  label: string
  stages: StageDefinition[]
}
