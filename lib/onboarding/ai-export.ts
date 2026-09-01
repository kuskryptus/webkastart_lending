import {
  emptyDiscovery2Answers,
  emptyOnboardingAnswers,
  type ClientWorkspaceResponse,
  type Discovery2Answers,
  type OnboardingAnswers,
  type WorkspaceSectionKey,
} from './types'

type AiAnswer = string | string[]

type AiResponse = {
  key: string
  question: string
  answer: AiAnswer
  answered: boolean
}

function cleanText(value: string) {
  return value.trim()
}

function cleanList(values: string[]) {
  return values.map(cleanText).filter(Boolean)
}

function response(key: string, question: string, answer: AiAnswer): AiResponse {
  const cleaned = Array.isArray(answer) ? cleanList(answer) : cleanText(answer)
  return { key, question, answer: cleaned, answered: cleaned.length > 0 }
}

function coreSections(answers: OnboardingAnswers) {
  return [
    {
      id: 'business',
      title: 'O klientovi a podnikaní',
      responses: [
        response('display_name', 'Meno alebo názov podnikania', answers.client.displayName),
        response('business_area', 'Čomu sa klient venuje', answers.business.area),
        response('business_description', 'Ako klient opisuje svoju prácu', answers.business.description),
        response('existing_website', 'Existujúci web', answers.existingWebsite),
        response('social_links', 'Sociálne siete', answers.socialLinks),
      ],
    },
    {
      id: 'audience_and_goal',
      title: 'Zákazníci a cieľ webu',
      responses: [
        response('target_audience', 'Komu klient najčastejšie pomáha', answers.targetAudience),
        response('website_goal', 'Čo sa má návštevník dozvedieť', answers.websiteGoal),
        response('desired_actions', 'Čo má návštevník urobiť', answers.desiredActions),
        response('services', 'Služby alebo ponuka', answers.services),
      ],
    },
    {
      id: 'website_content',
      title: 'Obsah stránky',
      responses: [
        response('sections', 'Požadované časti stránky', answers.sections),
        response('future_features', 'Budúce rozšírenia', answers.futureFeatures),
        response('other_sections', 'Ďalšie požiadavky', answers.otherSections),
      ],
    },
    {
      id: 'visual_direction',
      title: 'Vizuálny smer',
      responses: [
        response('design_preferences', 'Ako má web pôsobiť', answers.designPreferences),
        response('design_other', 'Ďalší vizuálny smer', answers.designOther),
        response('inspiration_urls', 'Inšpirácie', answers.inspirationUrls),
        response('dislikes', 'Čomu sa vyhnúť', answers.dislikes),
      ],
    },
    {
      id: 'contact',
      title: 'Kontakt',
      responses: [
        response('contact_name', 'Kontaktná osoba', answers.contact.name),
        response('contact_email', 'E-mail', answers.contact.email),
        response('contact_phone', 'Telefón', answers.contact.phone),
        response('preferred_contact', 'Preferovaný spôsob kontaktu', answers.contact.preferredMethod),
      ],
    },
    {
      id: 'billing',
      title: 'Fakturačné údaje',
      responses: [
        response('company_name', 'Fakturačný názov', answers.billing.companyName),
        response('company_id', 'IČO', answers.billing.companyId),
        response('tax_id', 'DIČ', answers.billing.taxId),
        response('vat_id', 'IČ DPH', answers.billing.vatId),
        response('billing_address', 'Fakturačná adresa', answers.billing.address),
      ],
    },
    {
      id: 'additional_notes',
      title: 'Ďalšie poznámky klienta',
      responses: [
        response('additional_notes', 'Ďalšie poznámky', answers.additionalNotes),
      ],
    },
  ]
}

const discoveryQuestions: Array<[keyof Discovery2Answers, string]> = [
  ['order_process', 'Ako dnes zákazník objednáva a ako celý proces prebieha?'],
  ['primary_products_and_prices', 'Aké produkty chce klient primárne ponúkať a v akých cenách?'],
  ['personalization_options', 'Čo všetko môže zákazník personalizovať?'],
  ['customer_appreciation', 'Čo zákazníci na tvorbe klienta najviac oceňujú?'],
  ['must_show_on_website', 'Čo chce klient na novom webe určite ukázať?'],
]

const workspaceSectionTitles: Record<WorkspaceSectionKey, string> = {
  core: 'Základný formulár',
  discovery_2: 'Doplňujúce otázky',
  files: 'Súbory a fotografie',
  creative_strategy: 'Kreatívna stratégia',
  creative_directions: 'Kreatívne smery',
  internal_notes: 'Interné poznámky',
}

export function createAiClientBrief(workspace: ClientWorkspaceResponse) {
  const core = workspace.core
  const discovery = workspace.discovery2
  const forms = [
    {
      id: 'basic_form',
      title: 'Základný formulár',
      completion: core?.progress || { completed: false, completedItems: 0, percentage: 0, totalItems: 0 },
      current_step: core?.currentStep || 1,
      revision: core?.revision || null,
      status: core?.status || 'not_started',
      updated_at: core?.updatedAt || null,
      sections: coreSections(core?.answers || emptyOnboardingAnswers),
    },
    {
      id: 'additional_questions',
      title: 'Doplňujúce otázky',
      completion: discovery?.progress || { completed: false, completedItems: 0, percentage: 0, totalItems: discoveryQuestions.length },
      current_step: discovery?.currentStep || 1,
      revision: discovery?.revision || null,
      status: discovery?.status || 'not_started',
      updated_at: discovery?.updatedAt || null,
      responses: discoveryQuestions.map(([key, question]) => response(key, question, (discovery?.answers || emptyDiscovery2Answers)[key])),
    },
  ]

  return {
    format: 'webkastart_ai_client_brief',
    version: 1,
    language: 'sk',
    project: {
      name: workspace.clientLabel,
      overall_completion_percent: workspace.overallProgress,
    },
    forms,
    workspace_sections: workspace.sections.map((section) => ({
      id: section.key,
      title: workspaceSectionTitles[section.key],
      client_visible: section.clientVisible,
      client_editable: section.clientEditable,
      content: section.content,
      updated_at: section.updatedAt,
    })),
    materials: workspace.assets
      .map((asset) => ({
        filename: asset.name,
        mime_type: asset.mimeType,
        size_bytes: Number(asset.size),
        status: asset.status,
        created_at: asset.createdAt,
        uploaded_by: asset.uploadedBy || 'unknown',
        visible_to_client: asset.clientVisible === true,
      })),
  }
}

export function stringifyAiClientBrief(workspace: ClientWorkspaceResponse) {
  return JSON.stringify(createAiClientBrief(workspace), null, 2)
}
