export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'no-score'

export type AcquisitionStage =
  | 'identified'
  | 'prospecting'
  | 'pitched'
  | 'vetting'
  | 'compliance'
  | 'signoff'

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

// Checklist completion tracking
export interface ChecklistItemCompletion {
  itemId: string
  completed: boolean
  value?: string // For dropdown, text, or currency types
  completedAt?: Date
  completedBy?: string
}

export interface StageChecklistCompletion {
  stageId: PipelineStage
  enteredAt: Date
  items: ChecklistItemCompletion[]
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
  acquisitionManager: string | null
  onboardingManager: string | null
  accountManager: string | null
  daysIdle: number
  gmvPotential: 'low' | 'medium' | 'high' | 'very-high' | null
  companiesHousePass: boolean
  dnbPass: boolean // Dun & Bradstreet
  rejectionReason: string | null
  mirakiLinked: boolean
  healthStatus: 'healthy' | 'at-risk' | 'critical' | null
  createdAt: Date
  updatedAt: Date
  checklistProgress?: StageChecklistCompletion[] // Track completion per stage
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
