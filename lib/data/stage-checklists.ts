import type { AcquisitionStage } from '@/lib/types/seller'

export interface ChecklistItem {
  id: string
  label: string
  required?: boolean
  type: 'checkbox' | 'dropdown' | 'text' | 'currency'
  options?: string[] // For dropdown type
}

export interface StageChecklist {
  stageId: AcquisitionStage
  stageLabel: string
  items: ChecklistItem[]
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

export function getChecklistForStage(stageId: AcquisitionStage): StageChecklist | undefined {
  return acquisitionChecklists.find((checklist) => checklist.stageId === stageId)
}

export function getAllChecklists(): StageChecklist[] {
  return acquisitionChecklists
}
