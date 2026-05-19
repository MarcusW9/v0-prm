import type { AcquisitionStage, OnboardingStage, AccountManagementStage, PipelineStage } from '@/lib/types/seller'

export interface ChecklistItem {
  id: string
  label: string
  required?: boolean
  type: 'checkbox' | 'dropdown' | 'text' | 'currency'
  options?: string[] // For dropdown type
}

export interface StageChecklist {
  stageId: PipelineStage
  stageLabel: string
  items: ChecklistItem[]
}

export interface PipelineChecklists {
  pipelineId: 'acquisition' | 'onboarding' | 'account-management'
  pipelineLabel: string
  stages: StageChecklist[]
}

export const acquisitionChecklists: StageChecklist[] = [
  {
    stageId: 'identified',
    stageLabel: 'Identified',
    items: [
      { id: 'sam-assigned', label: 'Assign Seller Acquisition Manager', type: 'checkbox', required: true },
    ],
  },
  {
    stageId: 'prospecting',
    stageLabel: 'Prospecting',
    items: [
      { id: 'first-contact', label: 'First contact made', type: 'checkbox' },
      { id: 'business-info-complete', label: 'Business information complete', type: 'checkbox' },
    ],
  },
  {
    stageId: 'pitched',
    stageLabel: 'Pitched',
    items: [
      { id: 'tcs-sent', label: 'T&Cs sent', type: 'checkbox' },
      { id: 'ethical-doc-sent', label: 'Ethical document sent', type: 'checkbox' },
      { id: 'seller-handbook-sent', label: 'Seller handbook sent', type: 'checkbox' },
      { id: 'discovery-form-sent', label: 'Discovery form sent', type: 'checkbox' },
      { id: 'discovery-form-completed', label: 'Discovery form completed', type: 'checkbox' },
      { id: 'tcs-agreed', label: 'T&Cs agreed', type: 'checkbox' },
      { id: 'gmv-potential', label: 'GMV Potential', type: 'dropdown', options: ['High', 'Medium', 'Low'] },
      { id: 'gmv-value', label: 'GMV Value (£)', type: 'currency' },
    ],
  },
  {
    stageId: 'vetting',
    stageLabel: 'Vetting',
    items: [
      { id: 'discovery-form-pass', label: 'Discovery form pass', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'companies-house-pass', label: 'Companies House pass', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'dnb-pass', label: 'D&B Pass', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'dnb-escalation', label: 'D&B Escalation required', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'escalation-approver', label: 'Escalation approver name', type: 'text' },
      { id: 'escalation-doc-link', label: 'Link to supporting document', type: 'text' },
    ],
  },
  {
    stageId: 'compliance',
    stageLabel: 'Compliance',
    items: [
      { id: 'introduction-made', label: 'Introduction made', type: 'checkbox' },
      { id: 'questionnaire-completed', label: 'Questionnaire completed', type: 'checkbox' },
      { id: 'escalation-meeting-required', label: 'Escalation meeting required', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'compliance-pass', label: 'Compliance pass', type: 'dropdown', options: ['Yes', 'No'] },
      { id: 'rejection-reason', label: 'Rejection reason (if No)', type: 'text' },
    ],
  },
  {
    stageId: 'signoff',
    stageLabel: 'Signoff',
    items: [
      { id: 'launch-plan-agreed', label: 'Launch plan agreed', type: 'checkbox' },
      { id: 'seller-forecast-complete', label: 'Seller forecast complete', type: 'checkbox' },
      { id: 'shop-registration-sent', label: 'Shop registration link sent', type: 'checkbox' },
    ],
  },
]

export const onboardingChecklists: StageChecklist[] = [
  {
    stageId: 'shop-created',
    stageLabel: 'Shop Created',
    items: [
      { id: 'shop-registered', label: 'Shop registration completed', type: 'checkbox' },
      { id: 'seller-credentials-sent', label: 'Seller credentials sent', type: 'checkbox' },
      { id: 'welcome-call-scheduled', label: 'Welcome call scheduled', type: 'checkbox' },
    ],
  },
  {
    stageId: 'initial-qc-pass',
    stageLabel: 'Initial QC Pass',
    items: [
      { id: 'product-data-reviewed', label: 'Product data reviewed', type: 'checkbox' },
      { id: 'imagery-approved', label: 'Imagery approved', type: 'checkbox' },
      { id: 'pricing-validated', label: 'Pricing validated', type: 'checkbox' },
    ],
  },
  {
    stageId: 'qc-reject',
    stageLabel: 'QC Reject',
    items: [
      { id: 'rejection-feedback-sent', label: 'Rejection feedback sent', type: 'checkbox' },
      { id: 'corrections-received', label: 'Corrections received', type: 'checkbox' },
    ],
  },
  {
    stageId: 'launch-upload',
    stageLabel: 'Launch Upload',
    items: [
      { id: 'products-uploaded', label: 'Products uploaded to platform', type: 'checkbox' },
      { id: 'inventory-synced', label: 'Inventory synced', type: 'checkbox' },
      { id: 'launch-date-confirmed', label: 'Launch date confirmed', type: 'checkbox' },
    ],
  },
  {
    stageId: 'sign-off',
    stageLabel: 'Sign Off',
    items: [
      { id: 'final-review-complete', label: 'Final review complete', type: 'checkbox' },
      { id: 'go-live-approval', label: 'Go-live approval', type: 'checkbox' },
    ],
  },
  {
    stageId: 'hypercare',
    stageLabel: 'Hypercare',
    items: [
      { id: 'first-week-checkin', label: 'First week check-in completed', type: 'checkbox' },
      { id: 'issues-resolved', label: 'Launch issues resolved', type: 'checkbox' },
      { id: 'hypercare-complete', label: 'Hypercare period complete', type: 'checkbox' },
    ],
  },
]

export const accountManagementChecklists: StageChecklist[] = [
  {
    stageId: 'stabilisation',
    stageLabel: 'Stabilisation',
    items: [
      { id: 'performance-baseline', label: 'Performance baseline established', type: 'checkbox' },
      { id: 'regular-cadence-set', label: 'Regular meeting cadence set', type: 'checkbox' },
      { id: 'kpis-agreed', label: 'KPIs agreed', type: 'checkbox' },
    ],
  },
  {
    stageId: 'growing',
    stageLabel: 'Growing',
    items: [
      { id: 'growth-plan-created', label: 'Growth plan created', type: 'checkbox' },
      { id: 'promotional-calendar', label: 'Promotional calendar agreed', type: 'checkbox' },
      { id: 'range-expansion', label: 'Range expansion opportunities identified', type: 'checkbox' },
    ],
  },
  {
    stageId: 'strategic',
    stageLabel: 'Strategic',
    items: [
      { id: 'strategic-review', label: 'Strategic partnership review completed', type: 'checkbox' },
      { id: 'joint-business-plan', label: 'Joint business plan agreed', type: 'checkbox' },
      { id: 'exclusive-opportunities', label: 'Exclusive opportunities discussed', type: 'checkbox' },
    ],
  },
  {
    stageId: 'performance-intervention',
    stageLabel: 'Performance Intervention',
    items: [
      { id: 'performance-issues-identified', label: 'Performance issues identified', type: 'checkbox' },
      { id: 'improvement-plan-created', label: 'Improvement plan created', type: 'checkbox' },
      { id: 'review-meeting-scheduled', label: 'Review meeting scheduled', type: 'checkbox' },
    ],
  },
]

export const allPipelineChecklists: PipelineChecklists[] = [
  {
    pipelineId: 'acquisition',
    pipelineLabel: 'Acquisition',
    stages: acquisitionChecklists,
  },
  {
    pipelineId: 'onboarding',
    pipelineLabel: 'Onboarding',
    stages: onboardingChecklists,
  },
  {
    pipelineId: 'account-management',
    pipelineLabel: 'Account Management',
    stages: accountManagementChecklists,
  },
]

export function getChecklistForStage(stageId: PipelineStage): StageChecklist | undefined {
  const allStages = [...acquisitionChecklists, ...onboardingChecklists, ...accountManagementChecklists]
  return allStages.find((checklist) => checklist.stageId === stageId)
}

export function getAllChecklists(): StageChecklist[] {
  return [...acquisitionChecklists, ...onboardingChecklists, ...accountManagementChecklists]
}

export function getPipelineForStage(stageId: PipelineStage): 'acquisition' | 'onboarding' | 'account-management' | undefined {
  if (acquisitionChecklists.some(c => c.stageId === stageId)) return 'acquisition'
  if (onboardingChecklists.some(c => c.stageId === stageId)) return 'onboarding'
  if (accountManagementChecklists.some(c => c.stageId === stageId)) return 'account-management'
  return undefined
}
