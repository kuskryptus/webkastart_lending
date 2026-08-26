export type OnboardingStatus = 'not_started' | 'in_progress' | 'submitted'

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
}

export type OnboardingProjectResponse = {
  answers: OnboardingAnswers
  assets: OnboardingAsset[]
  clientLabel: string
  currentStep: number
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
  inspirationUrls: [''],
  dislikes: '',
  existingWebsite: '',
  socialLinks: [''],
  contact: { name: '', email: '', phone: '', preferredMethod: '' },
  billing: { companyName: '', companyId: '', taxId: '', vatId: '', address: '' },
  additionalNotes: '',
}
