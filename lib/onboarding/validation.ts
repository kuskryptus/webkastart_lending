import { emptyOnboardingAnswers, type OnboardingAnswers } from './types'

export const ONBOARDING_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
export const MAX_UPLOAD_FILES = 100

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

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function sanitizeAnswers(input: unknown): OnboardingAnswers {
  const source = object(input)
  const client = object(source.client)
  const business = object(source.business)
  const contact = object(source.contact)
  const billing = object(source.billing)

  return {
    ...emptyOnboardingAnswers,
    client: { displayName: text(client.displayName, 160) },
    business: {
      area: text(business.area, 500),
      description: text(business.description, 3000),
    },
    targetAudience: text(source.targetAudience, 2000),
    websiteGoal: text(source.websiteGoal, 2000),
    desiredActions: list(source.desiredActions, 12, 100),
    services: text(source.services, 3000),
    sections: list(source.sections, 20, 100),
    otherSections: text(source.otherSections, 2000),
    futureFeatures: list(source.futureFeatures, 12, 100),
    designPreferences: list(source.designPreferences, 12, 100),
    designOther: text(source.designOther, 500),
    inspirationUrls: list(source.inspirationUrls, 5, 500),
    dislikes: text(source.dislikes, 2000),
    existingWebsite: text(source.existingWebsite, 500),
    socialLinks: list(source.socialLinks, 8, 500),
    contact: {
      name: text(contact.name, 160),
      email: text(contact.email, 254).toLowerCase(),
      phone: text(contact.phone, 80),
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
