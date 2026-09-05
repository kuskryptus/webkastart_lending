import {
  emptyDiscovery2Answers,
  emptyOnboardingAnswers,
  prefillFieldKeys,
  type Discovery2Answers,
  type AnswerFieldMetadata,
  type OnboardingAnswers,
  type ProductPriceItem,
} from './types'

export const ONBOARDING_TOKEN_PATTERN = /^(?:[A-Za-z0-9_-]{43}|[A-Za-z0-9_-]{48}\.[A-Za-z0-9_-]{43})$/
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
export const MAX_UPLOAD_FILES = 100
export const MAX_REPRESENTATIVE_PHOTOS = 5

export const allowedUploadTypes: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'text/plain': ['txt'],
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
  const contact = object(source.contact)
  const billing = object(source.billing)

  return {
    ...emptyOnboardingAnswers,
    fieldMetadata: fieldMetadata(source.fieldMetadata),
    client: { displayName: text(client.displayName, 160) },
    business: {
      area: text(business.area, 500),
      description: text(business.description, 3000),
    },
    projectType: text(source.projectType, 100),
    socialPlatforms: list(source.socialPlatforms, 8, 40),
    targetAudienceSelections: list(source.targetAudienceSelections, 20, 100),
    targetAudience: text(source.targetAudience, 2000),
    websiteExpectations: list(source.websiteExpectations, 20, 100),
    websiteExpectationsOther: text(source.websiteExpectationsOther, 1000),
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
    futureFeatures: list(source.futureFeatures, 16, 100),
    futureFeaturesOther: text(source.futureFeaturesOther, 1000),
    designPreferences: list(source.designPreferences, 24, 100),
    designOther: text(source.designOther, 500),
    colorPreferences: list(source.colorPreferences, 12, 100),
    colorPreferencesOther: text(source.colorPreferencesOther, 500),
    designDislikes: list(source.designDislikes, 16, 100),
    inspirationUrls: list(source.inspirationUrls, 5, 500),
    dislikes: text(source.dislikes, 2000),
    representativePhotoIds: uniqueList(source.representativePhotoIds, MAX_REPRESENTATIVE_PHOTOS, 100),
    brandStory: text(source.brandStory, 5000),
    existingWebsite: text(source.existingWebsite, 500),
    socialLinks: list(source.socialLinks, 8, 500),
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
  if (typeof mimeType !== 'string' || !allowedUploadTypes[mimeType]) {
    return { error: 'Tento typ súboru nepodporujeme.' }
  }
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0) {
    return { error: 'Súbor je prázdny alebo má neplatnú veľkosť.' }
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { error: 'Jeden súbor môže mať najviac 50 MB.' }
  }

  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  if (!allowedUploadTypes[mimeType].includes(extension)) {
    return { error: 'Prípona súboru nezodpovedá jeho typu.' }
  }

  return { extension }
}
