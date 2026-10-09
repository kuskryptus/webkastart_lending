import {
  emptyDiscovery2Answers,
  emptyOnboardingAnswers,
  prefillFieldKeys,
  type Discovery2Answers,
  type AnswerFieldMetadata,
  type OnboardingAnswers,
  type PageStructure,
  type ProductPriceItem,
} from './types'
import { completionTimeOptions, infrastructureStatusOptions, redesignChangeOptions, technicalRequirementOptions, trafficSourceOptions, websiteManagementOptions } from './options'

function normalizeExclusive(values: string[], exclusive: readonly string[]) {
  const concrete = values.filter((value) => !exclusive.includes(value))
  return concrete.length ? concrete : values.slice(0, 1)
}

export const ONBOARDING_TOKEN_PATTERN = /^(?:[A-Za-z0-9_-]{43}|[A-Za-z0-9_-]{48}\.[A-Za-z0-9_-]{43})$/
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024
export const MAX_UPLOAD_FILES = 100
export const MAX_REPRESENTATIVE_PHOTOS = 5
export const MAX_PAGE_STRUCTURE_SECTIONS = 30
export const MAX_WEBSITE_PAGES = 30
export const MAX_PAGE_STRUCTURE_ITEMS = 20
export const MAX_PAGE_STRUCTURE_PHOTOS = 20
export const MULTIPART_UPLOAD_THRESHOLD_BYTES = 64 * 1024 * 1024
export const MULTIPART_UPLOAD_PART_BYTES = 16 * 1024 * 1024

export const allowedUploadTypes: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/bmp': ['bmp'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'image/heic': ['heic'],
  'image/heif': ['heif'],
  'image/tiff': ['tif', 'tiff'],
  'image/svg+xml': ['svg'],
  'image/vnd.adobe.photoshop': ['psd'],
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/webm': ['webm'],
  'video/x-m4v': ['m4v'],
  'video/x-matroska': ['mkv'],
  'video/x-msvideo': ['avi'],
  'video/mpeg': ['mpeg', 'mpg'],
  'video/3gpp': ['3gp'],
  'audio/mpeg': ['mp3'],
  'audio/mp4': ['m4a'],
  'audio/wav': ['wav'],
  'audio/ogg': ['ogg', 'oga'],
  'audio/flac': ['flac'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'application/vnd.oasis.opendocument.text': ['odt'],
  'application/vnd.oasis.opendocument.spreadsheet': ['ods'],
  'application/vnd.oasis.opendocument.presentation': ['odp'],
  'application/rtf': ['rtf'],
  'text/csv': ['csv'],
  'text/plain': ['txt'],
  'application/zip': ['zip'],
  'application/x-7z-compressed': ['7z'],
  'application/vnd.rar': ['rar'],
  'application/gzip': ['gz'],
}

export function resolveUploadMimeType(name: string, reportedMimeType: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  const normalized = reportedMimeType.toLowerCase().trim()
  if (allowedUploadTypes[normalized]?.includes(extension)) return normalized
  const typeFromExtension = Object.entries(allowedUploadTypes)
    .find(([, extensions]) => extensions.includes(extension))?.[0]
  if (typeFromExtension) return typeFromExtension
  return /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(normalized)
    ? normalized
    : 'application/octet-stream'
}

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function list(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

function uniqueList(value: unknown, maxItems: number, maxLength: number) {
  return [...new Set(list(value, maxItems * 2, maxLength))].slice(0, maxItems)
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function sanitizePageStructure(input: unknown): PageStructure {
  const source = object(input)
  function sectionsFrom(value: unknown) {
    const rawSections = Array.isArray(value) ? value : []
    const sectionIds = new Set<string>()
    return rawSections.slice(0, MAX_PAGE_STRUCTURE_SECTIONS).flatMap((item) => {
      const section = object(item)
      const id = text(section.id, 64)
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || sectionIds.has(id)) return []
      sectionIds.add(id)

      const rawPhotos = Array.isArray(section.photos) ? section.photos : []
      const assetIds = new Set<string>()
      const photos = rawPhotos.slice(0, MAX_PAGE_STRUCTURE_PHOTOS).flatMap((photoValue) => {
        const photo = object(photoValue)
        const assetId = text(photo.assetId, 64)
        if (!/^[0-9a-f-]{36}$/i.test(assetId) || assetIds.has(assetId)) return []
        assetIds.add(assetId)
        return [{ assetId, description: text(photo.description, 1000) }]
      })

      return [{
        id,
        title: text(section.title, 160),
        description: text(section.description, 4000),
        items: list(section.items, MAX_PAGE_STRUCTURE_ITEMS, 300),
        photos,
      }]
    })
  }
  const pages = Array.isArray(source.pages) ? source.pages : undefined
  const pageIds = new Set<string>()
  return {
    sections: sectionsFrom(source.sections),
    ...(pages ? { pages: pages.slice(0, MAX_WEBSITE_PAGES).flatMap((item) => {
      const page = object(item)
      const id = text(page.id, 64)
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || pageIds.has(id)) return []
      pageIds.add(id)
      return [{
        id,
        title: text(page.title, 160),
        purpose: text(page.purpose, 2000),
        keyInformation: text(page.keyInformation, 3000),
        nextAction: text(page.nextAction, 1000),
        sections: sectionsFrom(page.sections),
      }]
    }) } : {}),
  }
}

function fieldMetadata(value: unknown): OnboardingAnswers['fieldMetadata'] {
  const source = object(value)
  const result: OnboardingAnswers['fieldMetadata'] = {}
  for (const key of prefillFieldKeys) {
    const item = object(source[key])
    const sourceType = text(item.source_type, 20)
    if (!['admin', 'client', 'crm', 'ai_prefill'].includes(sourceType)) continue
    const updatedAt = text(item.updated_at, 40)
    result[key] = {
      source_type: sourceType as AnswerFieldMetadata['source_type'],
      prefilled: item.prefilled === true,
      confirmed_by_client: item.confirmed_by_client === true,
      updated_at: updatedAt || new Date(0).toISOString(),
    }
  }
  return result
}

function productPriceItems(value: unknown): ProductPriceItem[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 20).map((item) => {
    const source = object(item)
    const rawType = text(source.type, 20)
    const priceType = text(source.priceType, 40)
    return {
      name: text(source.name, 200),
      type: (rawType === 'Produkt' || rawType === 'Služba' ? rawType : '') as ProductPriceItem['type'],
      price: text(source.price, 100),
      priceType: [
        'Presná cena',
        'Cena od',
        'Cenové rozpätie',
        'Cena na vyžiadanie',
        'Individuálna cena',
      ].includes(priceType) ? priceType as ProductPriceItem['priceType'] : '',
      note: text(source.note, 1000),
    }
  }).filter((item) => item.name || item.price || item.note)
}

export function sanitizeAnswers(input: unknown): OnboardingAnswers {
  const source = object(input)
  const client = object(source.client)
  const business = object(source.business)
  const domain = object(source.domain)
  const hosting = object(source.hosting)
  const contact = object(source.contact)
  const billing = object(source.billing)
  const metaCampaign = object(source.metaCampaign)
  const multiPage = object(source.multiPage)
  const existingWebsite = text(source.existingWebsite, 500)
  const existingWebsiteStatus = infrastructureStatusOptions.includes(source.existingWebsiteStatus as typeof infrastructureStatusOptions[number])
    ? source.existingWebsiteStatus as string : ''
  const hasExistingWebsite = existingWebsiteStatus === 'Áno' || (!existingWebsiteStatus && Boolean(existingWebsite))
  const redesignChanges = list(source.redesignChanges, 6, 120).filter((value) => redesignChangeOptions.includes(value as typeof redesignChangeOptions[number]))
  const desiredCompletion = completionTimeOptions.includes(source.desiredCompletion as typeof completionTimeOptions[number]) ? source.desiredCompletion as string : ''
  const trafficSources = list(source.trafficSources, 7, 120).filter((value) => trafficSourceOptions.includes(value as typeof trafficSourceOptions[number]))
  const technicalRequirements = list(source.technicalRequirements, 8, 120).filter((value) => technicalRequirementOptions.includes(value as typeof technicalRequirementOptions[number]))

  return {
    ...emptyOnboardingAnswers,
    fieldMetadata: fieldMetadata(source.fieldMetadata),
    client: { displayName: text(client.displayName, 160) },
    business: {
      address: text(business.address, 1000),
      area: text(business.area, 500),
      description: text(business.description, 3000),
      openingHours: text(business.openingHours, 2000),
    },
    projectType: text(source.projectType, 100),
    socialPlatforms: list(source.socialPlatforms, 8, 40),
    targetAudienceSelections: list(source.targetAudienceSelections, 20, 100),
    targetAudience: text(source.targetAudience, 2000),
    websiteExpectations: list(source.websiteExpectations, 20, 100),
    websiteExpectationsOther: text(source.websiteExpectationsOther, 1000),
    goalImportance: text(source.goalImportance, 5000),
    successCriteria: text(source.successCriteria, 5000),
    websitePriorities: text(source.websitePriorities, 5000),
    customerInsights: text(source.customerInsights, 5000),
    customerConcerns: text(source.customerConcerns, 5000),
    desiredCustomerReaction: text(source.desiredCustomerReaction, 3000),
    websiteInformation: list(source.websiteInformation, 20, 100),
    websiteGoal: text(source.websiteGoal, 2000),
    desiredActions: list(source.desiredActions, 20, 100),
    desiredActionsOther: text(source.desiredActionsOther, 1000),
    offeringTypes: list(source.offeringTypes, 12, 100),
    offerItems: list(source.offerItems, 20, 200),
    services: text(source.services, 3000),
    uniqueOffering: text(source.uniqueOffering, 3000),
    keyTakeaway: text(source.keyTakeaway, 3000),
    tenSecondHighlight: text(source.tenSecondHighlight, 3000),
    sections: list(source.sections, 24, 100),
    sectionsOther: text(source.sectionsOther, 1000),
    otherSections: text(source.otherSections, 2000),
    multiPage: {
      projectScope: text(multiPage.projectScope, 100),
      contentOwner: text(multiPage.contentOwner, 100),
      editableContent: list(multiPage.editableContent, 20, 100),
      contentChanges: text(multiPage.contentChanges, 1000),
      languages: text(multiPage.languages, 500),
      translationOwner: text(multiPage.translationOwner, 500),
      features: list(multiPage.features, 20, 100),
      featuresDetails: text(multiPage.featuresDetails, 3000),
      formsDetails: text(multiPage.formsDetails, 3000),
      integrations: text(multiPage.integrations, 3000),
      productMode: text(multiPage.productMode, 100),
      productCount: text(multiPage.productCount, 100),
      productSource: text(multiPage.productSource, 2000),
      shopUrl: text(multiPage.shopUrl, 500),
      shopPlatform: text(multiPage.shopPlatform, 200),
      productDetails: text(multiPage.productDetails, 3000),
      checkoutDetails: text(multiPage.checkoutDetails, 3000),
      migrationContent: text(multiPage.migrationContent, 3000),
      migrationUrls: text(multiPage.migrationUrls, 3000),
      decisionMaker: text(multiPage.decisionMaker, 160),
    },
    futureFeatures: list(source.futureFeatures, 16, 100),
    futureFeaturesOther: text(source.futureFeaturesOther, 1000),
    designPreferences: list(source.designPreferences, 24, 100),
    designOther: text(source.designOther, 500),
    brandFirstImpression: text(source.brandFirstImpression, 3000),
    colorPreferences: list(source.colorPreferences, 12, 100),
    colorPreferencesOther: text(source.colorPreferencesOther, 500),
    designDislikes: list(source.designDislikes, 16, 100),
    inspirationUrls: list(source.inspirationUrls, 5, 500),
    dislikes: text(source.dislikes, 2000),
    representativePhotoIds: uniqueList(source.representativePhotoIds, MAX_REPRESENTATIVE_PHOTOS, 100),
    brandStory: text(source.brandStory, 5000),
    existingWebsite: hasExistingWebsite ? existingWebsite : '',
    existingWebsiteStatus,
    redesignChanges: hasExistingWebsite ? normalizeExclusive(redesignChanges, ['Ešte neviem, potrebujem poradiť.']) : [],
    redesignDetails: hasExistingWebsite ? text(source.redesignDetails, 3000) : '',
    previousWebsiteExperience: text(source.previousWebsiteExperience, 5000),
    desiredCompletion,
    desiredCompletionDate: desiredCompletion === 'Iný termín.' && /^\d{4}-\d{2}-\d{2}$/.test(text(source.desiredCompletionDate, 10)) ? text(source.desiredCompletionDate, 10) : '',
    trafficSources: normalizeExclusive(trafficSources, ['Zatiaľ neviem.']),
    trafficSourcesOther: trafficSources.includes('Iné.') && !trafficSources.includes('Zatiaľ neviem.') ? text(source.trafficSourcesOther, 1000) : '',
    technicalRequirements: normalizeExclusive(technicalRequirements, ['Nemáme žiadne špeciálne požiadavky.', 'Neviem, potrebujem poradiť.']),
    technicalRequirementsDetails: technicalRequirements.some((value) => !['Nemáme žiadne špeciálne požiadavky.', 'Neviem, potrebujem poradiť.'].includes(value)) ? text(source.technicalRequirementsDetails, 3000) : '',
    websiteManagement: websiteManagementOptions.includes(source.websiteManagement as typeof websiteManagementOptions[number]) ? source.websiteManagement as string : '',
    domain: {
      ownership: text(domain.ownership, 80),
      name: text(domain.name, 253),
      registrar: text(domain.registrar, 200),
    },
    hosting: {
      status: text(hosting.status, 80),
      provider: text(hosting.provider, 200),
    },
    socialLinks: list(source.socialLinks, 8, 500),
    projectConstraints: text(source.projectConstraints, 5000),
    collaborationInvolvement: text(source.collaborationInvolvement, 5000),
    feedbackCommunication: text(source.feedbackCommunication, 5000),
    contact: {
      name: text(contact.name, 160),
      email: text(contact.email, 254).toLowerCase(),
      phone: text(contact.phone, 80),
      preferredMethods: list(contact.preferredMethods, 12, 100),
      preferredMethod: text(contact.preferredMethod, 80),
    },
    billing: {
      companyName: text(billing.companyName, 200),
      companyId: text(billing.companyId, 40),
      taxId: text(billing.taxId, 40),
      vatId: text(billing.vatId, 40),
      address: text(billing.address, 500),
    },
    additionalNotes: text(source.additionalNotes, 5000),
    metaCampaign: {
      platforms: list(metaCampaign.platforms, 4, 80),
      goals: list(metaCampaign.goals, 12, 120),
      goalsOther: text(metaCampaign.goalsOther, 1000),
      offer: text(metaCampaign.offer, 5000),
      offerPrice: text(metaCampaign.offerPrice, 1000),
      destinationTypes: list(metaCampaign.destinationTypes, 10, 120),
      destinationUrl: text(metaCampaign.destinationUrl, 500),
      audience: text(metaCampaign.audience, 4000),
      locations: text(metaCampaign.locations, 1000),
      existingAudience: text(metaCampaign.existingAudience, 2000),
      customerValue: text(metaCampaign.customerValue, 2000),
      monthlyAdBudget: text(metaCampaign.monthlyAdBudget, 100),
      numberOfOffers: text(metaCampaign.numberOfOffers, 500),
      duration: text(metaCampaign.duration, 100),
      desiredStart: text(metaCampaign.desiredStart, 100),
      servicesNeeded: list(metaCampaign.servicesNeeded, 16, 120),
      availableAssets: list(metaCampaign.availableAssets, 16, 120),
      availableAssetsOther: text(metaCampaign.availableAssetsOther, 1000),
      metaSetupStatus: text(metaCampaign.metaSetupStatus, 200),
      trackingStatus: text(metaCampaign.trackingStatus, 200),
      previousCampaignStatus: text(metaCampaign.previousCampaignStatus, 200),
      previousCampaignDetails: text(metaCampaign.previousCampaignDetails, 4000),
      successDefinition: text(metaCampaign.successDefinition, 3000),
      targetCostPerResult: text(metaCampaign.targetCostPerResult, 500),
      leadCapacity: text(metaCampaign.leadCapacity, 1000),
      restrictions: text(metaCampaign.restrictions, 3000),
    },
  }
}

export function sanitizeDiscovery2Answers(input: unknown): Discovery2Answers {
  const source = object(input)
  return {
    ...emptyDiscovery2Answers,
    order_methods: list(source.order_methods, 16, 100),
    order_methods_other: text(source.order_methods_other, 2000),
    order_process: text(source.order_process, 5000),
    products_and_prices: productPriceItems(source.products_and_prices),
    primary_products_and_prices: text(source.primary_products_and_prices, 5000),
    personalization_choices: list(source.personalization_choices, 20, 100),
    personalization_options: text(source.personalization_options, 5000),
    customer_appreciation_choices: list(source.customer_appreciation_choices, 20, 100),
    customer_appreciation: text(source.customer_appreciation, 5000),
    customer_quote: text(source.customer_quote, 3000),
    frequent_questions: list(source.frequent_questions, 20, 100),
    frequent_questions_other: text(source.frequent_questions_other, 2000),
    must_show_choices: list(source.must_show_choices, 20, 100),
    must_show_on_website: text(source.must_show_on_website, 5000),
  }
}

export function safeStorageFileName(name: string, extension: string) {
  const withoutExtension = name.replace(/\.[^.]+$/, '')
  const base = withoutExtension
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
  return `${base || 'file'}.${extension}`
}

export function validateAssetRename(name: unknown, currentName: string) {
  if (typeof name !== 'string') return { error: 'Zadajte nový názov fotografie.' } as const

  const normalizedName = name.normalize('NFC').trim()
  if (!normalizedName || normalizedName.length > 255) {
    return { error: 'Názov fotografie musí mať 1 až 255 znakov.' } as const
  }
  if (/[/\\\u0000-\u001f\u007f]/.test(normalizedName) || normalizedName === '.' || normalizedName === '..') {
    return { error: 'Názov fotografie obsahuje nepovolené znaky.' } as const
  }

  const currentExtension = currentName.match(/(\.[a-z0-9]{1,16})$/i)?.[1] || ''
  const nextExtension = normalizedName.match(/(\.[a-z0-9]{1,16})$/i)?.[1] || ''
  if (currentExtension.toLocaleLowerCase('sk') !== nextExtension.toLocaleLowerCase('sk')) {
    return { error: `Príponu súboru ${currentExtension || 'nie je možné'} zmeniť.` } as const
  }
  if (currentExtension && !normalizedName.slice(0, -currentExtension.length).trim()) {
    return { error: 'Názov fotografie nesmie byť prázdny.' } as const
  }

  return { name: normalizedName } as const
}

export function validateContact(answers: OnboardingAnswers) {
  const errors: Record<string, string> = {}

  if (!answers.contact.name) errors.name = 'Napíšte prosím meno kontaktnej osoby.'
  if (!answers.contact.email) {
    errors.email = 'Napíšte prosím e-mail, na ktorý sa vám môžeme ozvať.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.contact.email)) {
    errors.email = 'Skontrolujte prosím formát e-mailovej adresy.'
  }

  return errors
}

export function validateUpload(name: unknown, mimeType: unknown, size: unknown) {
  if (typeof name !== 'string' || !name.trim() || name.length > 255) {
    return { error: 'Súbor nemá platný názov.' }
  }
  if (typeof mimeType !== 'string') {
    return { error: 'Tento typ súboru nepodporujeme.' }
  }
  const resolvedMimeType = resolveUploadMimeType(name, mimeType)
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0) {
    return { error: 'Súbor je prázdny alebo má neplatnú veľkosť.' }
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { error: 'Jeden súbor môže mať najviac 5 GB.' }
  }

  const reportedExtension = name.split('.').pop()?.toLowerCase() ?? ''
  const extension = /^[a-z0-9]{1,16}$/.test(reportedExtension) ? reportedExtension : 'bin'

  return { extension, mimeType: resolvedMimeType }
}
