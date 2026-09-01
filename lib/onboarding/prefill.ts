import {
  prefillFieldKeys,
  type AnswerSourceType,
  type OnboardingAnswers,
  type PrefillFieldKey,
} from './types'

export function isPrefillFieldKey(value: unknown): value is PrefillFieldKey {
  return typeof value === 'string' && prefillFieldKeys.includes(value as PrefillFieldKey)
}

function fieldValue(answers: OnboardingAnswers, key: PrefillFieldKey): string | string[] {
  switch (key) {
    case 'client.displayName': return answers.client.displayName
    case 'contact.name': return answers.contact.name
    case 'contact.email': return answers.contact.email
    case 'contact.phone': return answers.contact.phone
    case 'existingWebsite': return answers.existingWebsite
    case 'socialLinks': return answers.socialLinks
    case 'business.area': return answers.business.area
    case 'projectType': return answers.projectType
    case 'contact.preferredMethods': return answers.contact.preferredMethods
    case 'websiteExpectations': return answers.websiteExpectations
    case 'additionalNotes': return answers.additionalNotes
  }
}

function hasValue(value: string | string[]) {
  return Array.isArray(value) ? value.some((item) => item.trim()) : Boolean(value.trim())
}

function sameValue(left: string | string[], right: string | string[]) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function markPrefilledFields(
  answers: OnboardingAnswers,
  fields: PrefillFieldKey[],
  sourceType: Exclude<AnswerSourceType, 'client'> = 'admin',
) {
  const fieldMetadata = { ...answers.fieldMetadata }
  const updatedAt = new Date().toISOString()
  for (const key of fields) {
    if (!hasValue(fieldValue(answers, key))) {
      delete fieldMetadata[key]
      continue
    }
    fieldMetadata[key] = {
      source_type: sourceType,
      prefilled: true,
      confirmed_by_client: false,
      updated_at: updatedAt,
    }
  }
  return { ...answers, fieldMetadata }
}

export function markClientFieldChange(answers: OnboardingAnswers, key: PrefillFieldKey) {
  const current = answers.fieldMetadata[key]
  return {
    ...answers,
    fieldMetadata: {
      ...answers.fieldMetadata,
      [key]: {
        source_type: 'client' as const,
        prefilled: current?.prefilled === true,
        confirmed_by_client: true,
        updated_at: new Date().toISOString(),
      },
    },
  }
}

export function reconcileClientMetadata(previous: OnboardingAnswers, next: OnboardingAnswers) {
  let result = { ...next, fieldMetadata: { ...previous.fieldMetadata } }
  for (const key of prefillFieldKeys) {
    if (!sameValue(fieldValue(previous, key), fieldValue(next, key))) {
      result = markClientFieldChange(result, key)
    }
  }
  return result
}

export function isUnconfirmedPrefill(answers: OnboardingAnswers, key: PrefillFieldKey) {
  const metadata = answers.fieldMetadata[key]
  return metadata?.prefilled === true && metadata.confirmed_by_client !== true
}
