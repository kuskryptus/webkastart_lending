export type OnboardingStatus = 'not_started' | 'in_progress' | 'submitted'

export type Discovery2Answers = {
  order_process: string
  primary_products_and_prices: string
  personalization_options: string
  customer_appreciation: string
  must_show_on_website: string
}

export const emptyDiscovery2Answers: Discovery2Answers = {
  order_process: '',
  primary_products_and_prices: '',
  personalization_options: '',
  customer_appreciation: '',
  must_show_on_website: '',
}

export type OnboardingAnswers = {
  client: {
    displayName: string
  }
  business: {
    area: string
    description: string
  }
  targetAudience: string
  websiteGoal: string
  desiredActions: string[]
  services: string
  sections: string[]
  otherSections: string
  futureFeatures: string[]
  designPreferences: string[]
  designOther: string
  inspirationUrls: string[]
  dislikes: string
  existingWebsite: string
  socialLinks: string[]
  contact: {
    name: string
    email: string
    phone: string
    preferredMethod: string
  }
  billing: {
    companyName: string
    companyId: string
    taxId: string
    vatId: string
    address: string
  }
  additionalNotes: string
}

export type OnboardingAsset = {
  id: string
  name: string
  mimeType: string
  size: number
  status: 'pending' | 'uploaded'
  createdAt: string
  uploadedBy?: 'client' | 'admin'
  clientVisible?: boolean
}

export const workspaceSectionKeys = [
  'core',
  'discovery_2',
  'files',
  'creative_strategy',
  'creative_directions',
  'internal_notes',
] as const

export type WorkspaceSectionKey = typeof workspaceSectionKeys[number]

export type WorkspaceSection = {
  key: WorkspaceSectionKey
  clientVisible: boolean
  clientEditable: boolean
  content: string
  updatedAt: string
}

export type WorkspaceProgress = {
  completed: boolean
  completedItems: number
  percentage: number
  totalItems: number
}

export type ClientWorkspaceResponse = {
  clientLabel: string
  overallProgress: number
  sections: WorkspaceSection[]
  core: {
    answers: OnboardingAnswers
    currentStep: number
    progress: WorkspaceProgress
    revision: number
    status: OnboardingStatus
    updatedAt: string
  } | null
  discovery2: {
    answers: Discovery2Answers
    currentStep: number
    progress: WorkspaceProgress
    revision: number
    status: OnboardingStatus
    updatedAt: string
  } | null
  assets: OnboardingAsset[]
}

export type OnboardingProjectResponse = {
  answers: OnboardingAnswers
  assets: OnboardingAsset[]
  clientLabel: string
  currentStep: number
  revision: number
  status: OnboardingStatus
  updatedAt: string
}

export type Discovery2Response = {
  answers: Discovery2Answers
  clientLabel: string
  currentStep: number
  revision: number
  status: OnboardingStatus
  updatedAt: string
}

export const emptyOnboardingAnswers: OnboardingAnswers = {
  client: { displayName: '' },
  business: { area: '', description: '' },
  targetAudience: '',
  websiteGoal: '',
  desiredActions: [],
  services: '',
  sections: [],
  otherSections: '',
  futureFeatures: [],
  designPreferences: [],
  designOther: '',
  inspirationUrls: [''],
  dislikes: '',
  existingWebsite: '',
  socialLinks: [''],
  contact: { name: '', email: '', phone: '', preferredMethod: '' },
  billing: { companyName: '', companyId: '', taxId: '', vatId: '', address: '' },
  additionalNotes: '',
}
