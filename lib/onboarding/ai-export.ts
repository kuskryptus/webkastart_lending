import type { ClientWorkspaceResponse, Discovery2Answers, OnboardingAnswers } from './types'

type AiAnswer = string | string[]

type AiResponse = {
  key: string
  question: string
  answer: AiAnswer
}

function cleanText(value: string) {
  return value.trim()
}

function cleanList(values: string[]) {
  return values.map(cleanText).filter(Boolean)
}

function response(key: string, question: string, answer: AiAnswer): AiResponse | null {
  const cleaned = Array.isArray(answer) ? cleanList(answer) : cleanText(answer)
  return cleaned.length ? { key, question, answer: cleaned } : null
}

function responses(items: Array<AiResponse | null>) {
  return items.filter((item): item is AiResponse => item !== null)
}

function coreSections(answers: OnboardingAnswers) {
  return [
    {
      id: 'business',
      title: 'O klientovi a podnikaní',
      responses: responses([
        response('display_name', 'Meno alebo názov podnikania', answers.client.displayName),
        response('business_area', 'Čomu sa klient venuje', answers.business.area),
        response('business_description', 'Ako klient opisuje svoju prácu', answers.business.description),
        response('existing_website', 'Existujúci web', answers.existingWebsite),
        response('social_links', 'Sociálne siete', answers.socialLinks),
      ]),
    },
    {
      id: 'audience_and_goal',
      title: 'Zákazníci a cieľ webu',
      responses: responses([
        response('target_audience', 'Komu klient najčastejšie pomáha', answers.targetAudience),
        response('website_goal', 'Čo sa má návštevník dozvedieť', answers.websiteGoal),
        response('desired_actions', 'Čo má návštevník urobiť', answers.desiredActions),
        response('services', 'Služby alebo ponuka', answers.services),
      ]),
    },
    {
      id: 'website_content',
      title: 'Obsah stránky',
      responses: responses([
        response('sections', 'Požadované časti stránky', answers.sections),
        response('future_features', 'Budúce rozšírenia', answers.futureFeatures),
        response('other_sections', 'Ďalšie požiadavky', answers.otherSections),
      ]),
    },
    {
      id: 'visual_direction',
      title: 'Vizuálny smer',
      responses: responses([
        response('design_preferences', 'Ako má web pôsobiť', answers.designPreferences),
        response('design_other', 'Ďalší vizuálny smer', answers.designOther),
        response('inspiration_urls', 'Inšpirácie', answers.inspirationUrls),
        response('dislikes', 'Čomu sa vyhnúť', answers.dislikes),
      ]),
    },
    {
      id: 'contact',
      title: 'Kontakt',
      responses: responses([
        response('contact_name', 'Kontaktná osoba', answers.contact.name),
        response('contact_email', 'E-mail', answers.contact.email),
        response('contact_phone', 'Telefón', answers.contact.phone),
        response('preferred_contact', 'Preferovaný spôsob kontaktu', answers.contact.preferredMethod),
      ]),
    },
    {
      id: 'billing',
      title: 'Fakturačné údaje',
      responses: responses([
        response('company_name', 'Fakturačný názov', answers.billing.companyName),
        response('company_id', 'IČO', answers.billing.companyId),
        response('tax_id', 'DIČ', answers.billing.taxId),
        response('vat_id', 'IČ DPH', answers.billing.vatId),
        response('billing_address', 'Fakturačná adresa', answers.billing.address),
      ]),
    },
    {
      id: 'additional_notes',
      title: 'Ďalšie poznámky klienta',
      responses: responses([
        response('additional_notes', 'Ďalšie poznámky', answers.additionalNotes),
      ]),
    },
  ].filter((section) => section.responses.length > 0)
}

const discoveryQuestions: Array<[keyof Discovery2Answers, string]> = [
  ['order_process', 'Ako dnes zákazník objednáva a ako celý proces prebieha?'],
  ['primary_products_and_prices', 'Aké produkty chce klient primárne ponúkať a v akých cenách?'],
  ['personalization_options', 'Čo všetko môže zákazník personalizovať?'],
  ['customer_appreciation', 'Čo zákazníci na tvorbe klienta najviac oceňujú?'],
  ['must_show_on_website', 'Čo chce klient na novom webe určite ukázať?'],
]

export function createAiClientBrief(workspace: ClientWorkspaceResponse) {
  const forms: Array<Record<string, unknown>> = []

  if (workspace.core) {
    forms.push({
      id: 'basic_form',
      title: 'Základný formulár',
      completion_percent: workspace.core.progress.percentage,
      status: workspace.core.status,
      updated_at: workspace.core.updatedAt,
      sections: coreSections(workspace.core.answers),
    })
  }

  if (workspace.discovery2) {
    forms.push({
      id: 'additional_questions',
      title: 'Doplňujúce otázky',
      completion_percent: workspace.discovery2.progress.percentage,
      status: workspace.discovery2.status,
      updated_at: workspace.discovery2.updatedAt,
      responses: responses(discoveryQuestions.map(([key, question]) => response(key, question, workspace.discovery2!.answers[key]))),
    })
  }

  return {
    format: 'webkastart_ai_client_brief',
    version: 1,
    language: 'sk',
    project: {
      name: workspace.clientLabel,
      overall_completion_percent: workspace.overallProgress,
    },
    forms,
    materials: workspace.assets
      .filter((asset) => asset.status === 'uploaded')
      .map((asset) => ({
        filename: asset.name,
        mime_type: asset.mimeType,
        size_bytes: Number(asset.size),
        uploaded_by: asset.uploadedBy || 'unknown',
        visible_to_client: asset.clientVisible === true,
      })),
  }
}

export function stringifyAiClientBrief(workspace: ClientWorkspaceResponse) {
  return JSON.stringify(createAiClientBrief(workspace), null, 2)
}
