export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'no-score'

export type SellerStatus = 'active' | 'delayed' | 'terminated'

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

export type SellerCategory = 'electronics' | 'home' | 'toys' | 'garden' | 'kitchen' | 'furniture' | 'lighting' | 'other'

export type IntegrationMethod = 'linnworks' | 'channelAdvisor' | 'brightpearl' | 'tradegecko' | 'manual' | 'other'

export type Agency = 'time-online' | 'ecommerce-agency' | 'retail-solutions' | 'direct' | 'other'

export type ContactRole = 'account' | 'technical' | 'operations' | 'commercial' | 'other'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: ContactRole
  roleDescription?: string // Free text for 'other' role
}

export interface RegisteredAddress {
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface Seller {
  id: string
  // Legal Identity (read-only in UI)
  companyName: string
  crn: string // Company Registration Number
  countryOfRegistration: string
  vatNumber: string | null
  registeredAddress: RegisteredAddress
  // Business Details
  websiteUrl: string | null
  primaryProductCategories: string[] // e.g. ['toys', 'games']
  numberOfProductsExpected: number | null
  // Primary contact (mandatory)
  primaryContact: Contact
  // Additional contacts (optional array)
  additionalContacts: Contact[]
  priorityScore: number | null // 1.0 - 5.0 scale, null for no score
  pipeline: PipelineType
  stage: PipelineStage
  acquisitionManager: string | null
  onboardingManager: string | null
  accountManager: string | null
  // Filter dimensions
  category: SellerCategory
  integrationMethod: IntegrationMethod | null
  agency: Agency
  daysIdle: number
  gmvPotential: 'low' | 'medium' | 'high' | 'very-high' | null
  companiesHousePass: boolean
  dnbPass: boolean // Dun & Bradstreet
  rejectionReason: string | null
  miraklLinked: boolean
  healthStatus: 'healthy' | 'at-risk' | 'critical' | null
  status: SellerStatus
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
