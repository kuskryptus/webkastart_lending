export type OnboardingStatus = 'not_started' | 'in_progress' | 'submitted'

export const prefillFieldKeys = [
  'client.displayName',
  'contact.name',
  'contact.email',
  'contact.phone',
  'existingWebsite',
  'socialLinks',
  'business.area',
  'projectType',
  'contact.preferredMethods',
  'websiteExpectations',
  'additionalNotes',
] as const

export type PrefillFieldKey = typeof prefillFieldKeys[number]
export type AnswerSourceType = 'admin' | 'client' | 'crm' | 'ai_prefill'
export type AnswerFieldMetadata = {
  source_type: AnswerSourceType
  prefilled: boolean
  confirmed_by_client: boolean
  updated_at: string
}

export type ProductPriceItem = {
  name: string
  type: 'Produkt' | 'Služba' | ''
  price: string
  priceType: 'Presná cena' | 'Cena od' | 'Cenové rozpätie' | 'Cena na vyžiadanie' | 'Individuálna cena' | ''
  note: string
}

export type Discovery2Answers = {
  order_methods: string[]
  order_methods_other: string
  order_process: string
  products_and_prices: ProductPriceItem[]
  primary_products_and_prices: string
  personalization_choices: string[]
  personalization_options: string
  customer_appreciation_choices: string[]
  customer_appreciation: string
  customer_quote: string
  frequent_questions: string[]
  frequent_questions_other: string
  must_show_choices: string[]
  must_show_on_website: string
}

export const emptyDiscovery2Answers: Discovery2Answers = {
  order_methods: [],
  order_methods_other: '',
  order_process: '',
  products_and_prices: [],
  primary_products_and_prices: '',
  personalization_choices: [],
  personalization_options: '',
  customer_appreciation_choices: [],
  customer_appreciation: '',
  customer_quote: '',
  frequent_questions: [],
  frequent_questions_other: '',
  must_show_choices: [],
  must_show_on_website: '',
}

export type OnboardingAnswers = {
  fieldMetadata: Partial<Record<PrefillFieldKey, AnswerFieldMetadata>>
  client: {
    displayName: string
  }
  business: {
    area: string
    description: string
  }
  projectType: string
  socialPlatforms: string[]
  targetAudienceSelections: string[]
  targetAudience: string
  websiteExpectations: string[]
  websiteExpectationsOther: string
  websiteInformation: string[]
  websiteGoal: string
  desiredActions: string[]
  desiredActionsOther: string
  offeringTypes: string[]
  offerItems: string[]
  services: string
  sections: string[]
  sectionsOther: string
  otherSections: string
  futureFeatures: string[]
  futureFeaturesOther: string
  designPreferences: string[]
  designOther: string
  colorPreferences: string[]
  colorPreferencesOther: string
  designDislikes: string[]
  inspirationUrls: string[]
  dislikes: string
  existingWebsite: string
  socialLinks: string[]
  contact: {
    name: string
    email: string
    phone: string
    preferredMethods: string[]
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
  fieldMetadata: {},
  client: { displayName: '' },
  business: { area: '', description: '' },
  projectType: '',
  socialPlatforms: [''],
  targetAudienceSelections: [],
  targetAudience: '',
  websiteExpectations: [],
  websiteExpectationsOther: '',
  websiteInformation: [],
  websiteGoal: '',
  desiredActions: [],
  desiredActionsOther: '',
  offeringTypes: [],
  offerItems: [],
  services: '',
  sections: [],
  sectionsOther: '',
  otherSections: '',
  futureFeatures: [],
  futureFeaturesOther: '',
  designPreferences: [],
  designOther: '',
  colorPreferences: [],
  colorPreferencesOther: '',
  designDislikes: [],
  inspirationUrls: [''],
  dislikes: '',
  existingWebsite: '',
  socialLinks: [''],
  contact: { name: '', email: '', phone: '', preferredMethods: [], preferredMethod: '' },
  billing: { companyName: '', companyId: '', taxId: '', vatId: '', address: '' },
  additionalNotes: '',
}
