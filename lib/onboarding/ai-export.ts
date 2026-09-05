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
        response('project_type', 'Typ projektu', answers.projectType),
        response('business_description', 'Povedzte mi trochu viac o vašom podnikaní a o tom, čomu sa venujete.', answers.business.description),
        response('brand_story', 'Je za značkou osobný príbeh, ktorý by mal zákazník poznať?', answers.brandStory),
        response('existing_website', 'Existujúci web', answers.existingWebsite),
        response('previous_website_experience', 'Mali ste už web alebo ste skúšali niečo podobné? Čo fungovalo a čo nie?', answers.previousWebsiteExperience),
        response('social_platforms', 'Platformy sociálnych sietí', answers.socialPlatforms),
        response('social_links', 'Sociálne siete', answers.socialLinks),
      ],
    },
    {
      id: 'audience_and_goal',
      title: 'Zákazníci a cieľ webu',
      responses: [
        response('target_audience', 'Komu klient najčastejšie pomáha', answers.targetAudience),
        response('target_audience_selections', 'Typy zákazníkov', answers.targetAudienceSelections),
        response('website_expectations', 'Čo chcete pomocou nového webu dosiahnuť?', answers.websiteExpectations),
        response('website_expectations_other', 'Iný cieľ nového webu', answers.websiteExpectationsOther),
        response('goal_importance', 'Prečo je pre vás tento cieľ dôležitý?', answers.goalImportance),
        response('success_criteria', 'Podľa čoho spoznáte, že nový web funguje a ste s ním spokojný?', answers.successCriteria),
        response('website_priorities', 'Čo je pre vás na novom webe najdôležitejšie?', answers.websitePriorities),
        response('customer_insights', 'Čo viete zo skúseností o svojich zákazníkoch – čo najviac riešia, oceňujú alebo sa pýtajú?', answers.customerInsights),
        response('website_information', 'Čo sa má návštevník dozvedieť', answers.websiteInformation),
        response('website_goal', 'Čo sa má návštevník dozvedieť', answers.websiteGoal),
        response('desired_actions', 'Čo má návštevník urobiť', answers.desiredActions),
        response('desired_actions_other', 'Iná požadovaná akcia', answers.desiredActionsOther),
        response('offering_types', 'Typ ponuky', answers.offeringTypes),
        response('offer_items', 'Konkrétne produkty a služby', answers.offerItems),
        response('services', 'Služby alebo ponuka', answers.services),
        response('unique_offering', 'Čo je na ponuke najviac jedinečné?', answers.uniqueOffering),
        response('key_takeaway', 'Čo si má návštevník po odchode zo stránky zapamätať?', answers.keyTakeaway),
        response('ten_second_highlight', 'Čo ukázať návštevníkovi ako prvé počas 10 sekúnd?', answers.tenSecondHighlight),
      ],
    },
    {
      id: 'website_content',
      title: 'Obsah stránky',
      responses: [
        response('sections', 'Požadované časti stránky', answers.sections),
        response('sections_other', 'Iná časť stránky', answers.sectionsOther),
        response('future_features', 'Budúce rozšírenia', answers.futureFeatures),
        response('future_features_other', 'Iné budúce rozšírenie', answers.futureFeaturesOther),
        response('other_sections', 'Ďalšie požiadavky', answers.otherSections),
      ],
    },
    {
      id: 'visual_direction',
      title: 'Vizuálny smer',
      responses: [
        response('design_preferences', 'Aký pocit má mať človek pri návšteve stránky?', answers.designPreferences),
        response('design_other', 'Iný želaný pocit', answers.designOther),
        response('color_preferences', 'Farebné preferencie', answers.colorPreferences),
        response('color_preferences_other', 'Iná farebná preferencia', answers.colorPreferencesOther),
        response('inspiration_urls', 'Inšpirácie', answers.inspirationUrls),
        response('design_dislikes', 'Čomu sa má dizajn vyhnúť', answers.designDislikes),
        response('dislikes', 'Čomu sa vyhnúť', answers.dislikes),
        response('representative_photo_ids', 'Fotografie, ktoré najlepšie reprezentujú značku', answers.representativePhotoIds),
        response('project_constraints', 'Je niečo, čo musím pri návrhu rešpektovať alebo o čom by som mal vedieť?', answers.projectConstraints),
      ],
    },
    {
      id: 'collaboration',
      title: 'Spolupráca',
      responses: [
        response('collaboration_involvement', 'Ako veľmi chcete byť zapojený do návrhu a jednotlivých rozhodnutí?', answers.collaborationInvolvement),
        response('feedback_communication', 'Ako vám najviac vyhovuje komunikovať a dávať spätnú väzbu?', answers.feedbackCommunication),
      ],
    },
    {
      id: 'contact',
      title: 'Kontakt',
      responses: [
        response('contact_name', 'Kontaktná osoba', answers.contact.name),
        response('contact_email', 'E-mail', answers.contact.email),
        response('contact_phone', 'Telefón', answers.contact.phone),
        response('preferred_contacts', 'Preferované spôsoby kontaktu zákazníkov', answers.contact.preferredMethods),
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
        response('additional_notes', 'Je ešte niečo dôležité, na čo som sa nespýtal a mal by som to pred návrhom webu vedieť?', answers.additionalNotes),
      ],
    },
  ]
}

const discoveryQuestions: Array<[string, string, (answers: Discovery2Answers) => AiAnswer]> = [
  ['order_methods', 'Ako dnes zákazník objednáva?', (answers) => [...answers.order_methods, answers.order_methods_other, answers.order_process]],
  ['products_and_prices', 'Aké produkty alebo služby klient ponúka a v akých cenách?', (answers) => [
    ...answers.products_and_prices.map((item) => [item.name, item.type, item.priceType, item.price, item.note].filter(Boolean).join(' · ')),
    answers.primary_products_and_prices,
  ]],
  ['personalization_choices', 'Čo všetko môže zákazník prispôsobiť?', (answers) => [...answers.personalization_choices, answers.personalization_options]],
  ['customer_appreciation_choices', 'Čo zákazníci najviac oceňujú?', (answers) => [...answers.customer_appreciation_choices, answers.customer_appreciation, answers.customer_quote]],
  ['frequent_questions', 'Čo sa zákazníci najčastejšie pýtajú?', (answers) => [...answers.frequent_questions, answers.frequent_questions_other]],
  ['must_show_choices', 'Čo musí byť na novom webe určite?', (answers) => [...answers.must_show_choices, answers.must_show_on_website]],
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
      responses: discoveryQuestions.map(([key, question, answer]) => response(key, question, answer(discovery?.answers || emptyDiscovery2Answers))),
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
    answer_metadata: core?.answers.fieldMetadata || {},
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
        selected_as_brand_representative: core?.answers.representativePhotoIds.includes(asset.id) === true,
      })),
  }
}

export function stringifyAiClientBrief(workspace: ClientWorkspaceResponse) {
  return JSON.stringify(createAiClientBrief(workspace), null, 2)
}
