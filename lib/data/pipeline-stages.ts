import type { PipelineDefinition, StageDefinition, PipelineType, PipelineStage } from '@/lib/types/seller'

export const acquisitionStages: StageDefinition[] = [
  { id: 'identified', label: 'Identified', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  { id: 'prospecting', label: 'Prospecting', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  { id: 'pitched', label: 'Pitched', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  { id: 'vetting', label: 'Vetting', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  { id: 'compliance', label: 'Compliance', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'signoff', label: 'Signoff', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
]

export const onboardingStages: StageDefinition[] = [
  { id: 'shop-created', label: 'Shop Created', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'initial-qc-pass', label: 'Initial QC Pass', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  { id: 'qc-reject', label: 'QC Reject', color: 'text-red-700', bgColor: 'bg-red-50' },
  { id: 'launch-upload', label: 'Launch Upload', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  { id: 'sign-off', label: 'Sign Off', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  { id: 'hypercare', label: 'Hypercare', color: 'text-orange-700', bgColor: 'bg-orange-50' },
]

export const accountManagementStages: StageDefinition[] = [
  { id: 'stabilisation', label: 'Stabilisation', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'growing', label: 'Growing', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  { id: 'strategic', label: 'Strategic', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  { id: 'performance-intervention', label: 'Performance Intervention', color: 'text-red-700', bgColor: 'bg-red-50' },
]

export const pipelines: PipelineDefinition[] = [
  { id: 'acquisition', label: 'Acquisition Pipeline', stages: acquisitionStages },
  { id: 'onboarding', label: 'Onboarding Pipeline', stages: onboardingStages },
  { id: 'account-management', label: 'Account Management', stages: accountManagementStages },
]

export function getPipelineStages(pipelineType: PipelineType): StageDefinition[] {
  switch (pipelineType) {
    case 'acquisition':
      return acquisitionStages
    case 'onboarding':
      return onboardingStages
    case 'account-management':
      return accountManagementStages
    default:
      return acquisitionStages
  }
}

export function getStageDefinition(stage: PipelineStage): StageDefinition | undefined {
  const allStages = [...acquisitionStages, ...onboardingStages, ...accountManagementStages]
  return allStages.find(s => s.id === stage)
}

export function getPriorityColor(score: number | null): { bg: string; text: string } {
  if (score === null) return { bg: 'bg-slate-100', text: 'text-slate-500' }
  if (score >= 3.5) return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
  if (score >= 3.0) return { bg: 'bg-yellow-100', text: 'text-yellow-700' }
  if (score >= 2.5) return { bg: 'bg-orange-100', text: 'text-orange-700' }
  return { bg: 'bg-red-100', text: 'text-red-700' }
}

export function getPriorityLevel(score: number | null): string {
  if (score === null) return 'No Score'
  if (score >= 3.5) return 'Low'
  if (score >= 3.0) return 'Medium'
  if (score >= 2.5) return 'High'
  return 'Critical'
}
