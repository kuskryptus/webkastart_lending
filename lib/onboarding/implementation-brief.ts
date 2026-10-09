import { createAiClientBrief, createPageStructureSectionsMarkdown } from './ai-export'
import type { ClientWorkspaceResponse, ImplementationFieldSelection, OnboardingAsset } from './types'

type FieldGroup = {
  key: string
  responseKeys: readonly string[]
  sectionId: string
  title: string
}

export const implementationFieldGroups = [
  { key: 'core.display_name', sectionId: 'business', title: 'Meno alebo názov podnikania', responseKeys: ['display_name'] },
  { key: 'core.business_area', sectionId: 'business', title: 'Čomu sa klient venuje', responseKeys: ['business_area'] },
  { key: 'core.project_type', sectionId: 'business', title: 'Typ projektu', responseKeys: ['project_type'] },
  { key: 'core.business_description', sectionId: 'business', title: 'Opis podnikania', responseKeys: ['business_description'] },
  { key: 'core.brand_story', sectionId: 'business', title: 'Príbeh značky', responseKeys: ['brand_story'] },
  { key: 'core.existing_website', sectionId: 'business', title: 'Existujúci web', responseKeys: ['existing_website'] },
  { key: 'core.existing_website_status', sectionId: 'business', title: 'Má klient existujúci web?', responseKeys: ['existing_website_status'] },
  { key: 'core.redesign_changes', sectionId: 'business', title: 'Požadované zmeny existujúceho webu', responseKeys: ['redesign_changes', 'redesign_details'] },
  { key: 'core.previous_website_experience', sectionId: 'business', title: 'Predchádzajúce skúsenosti s webom', responseKeys: ['previous_website_experience'] },
  { key: 'core.social_links', sectionId: 'business', title: 'Sociálne siete', responseKeys: ['social_platforms', 'social_links'] },
  { key: 'core.domain_ownership', sectionId: 'business', title: 'Stav domény', responseKeys: ['domain_ownership'] },
  { key: 'core.domain_name', sectionId: 'business', title: 'Doména', responseKeys: ['domain_name'] },
  { key: 'core.domain_registrar', sectionId: 'business', title: 'Registrátor domény', responseKeys: ['domain_registrar'] },
  { key: 'core.hosting_status', sectionId: 'business', title: 'Stav webhostingu', responseKeys: ['hosting_status'] },
  { key: 'core.hosting_provider', sectionId: 'business', title: 'Poskytovateľ webhostingu', responseKeys: ['hosting_provider'] },
  { key: 'core.technical_requirements', sectionId: 'business', title: 'Technické požiadavky', responseKeys: ['technical_requirements'] },
  { key: 'core.technical_requirements_details', sectionId: 'business', title: 'Podrobnosti technických požiadaviek', responseKeys: ['technical_requirements_details'] },
  { key: 'core.target_audience', sectionId: 'audience_and_goal', title: 'Ideálny zákazník', responseKeys: ['target_audience_selections', 'target_audience'] },
  { key: 'core.traffic_sources', sectionId: 'audience_and_goal', title: 'Zdroje návštevnosti', responseKeys: ['traffic_sources'] },
  { key: 'core.traffic_sources_other', sectionId: 'audience_and_goal', title: 'Iný zdroj návštevnosti', responseKeys: ['traffic_sources_other'] },
  { key: 'core.customer_insights', sectionId: 'audience_and_goal', title: 'Poznatky o zákazníkoch', responseKeys: ['customer_insights'] },
  { key: 'core.customer_concerns', sectionId: 'audience_and_goal', title: 'Obavy zákazníkov', responseKeys: ['customer_concerns'] },
  { key: 'core.desired_customer_reaction', sectionId: 'audience_and_goal', title: 'Požadovaná reakcia zákazníka', responseKeys: ['desired_customer_reaction'] },
  { key: 'core.website_expectations', sectionId: 'audience_and_goal', title: 'Ciele nového webu', responseKeys: ['website_expectations', 'website_expectations_other'] },
  { key: 'core.goal_importance', sectionId: 'audience_and_goal', title: 'Dôležitosť cieľa', responseKeys: ['goal_importance'] },
  { key: 'core.success_criteria', sectionId: 'audience_and_goal', title: 'Kritériá úspechu', responseKeys: ['success_criteria'] },
  { key: 'core.website_priorities', sectionId: 'audience_and_goal', title: 'Priority webu', responseKeys: ['website_priorities'] },
  { key: 'core.website_information', sectionId: 'audience_and_goal', title: 'Čo sa má návštevník dozvedieť', responseKeys: ['website_information', 'website_goal'] },
  { key: 'core.desired_actions', sectionId: 'audience_and_goal', title: 'Čo má návštevník urobiť', responseKeys: ['desired_actions', 'desired_actions_other'] },
  { key: 'core.offering', sectionId: 'audience_and_goal', title: 'Ponuka produktov a služieb', responseKeys: ['offering_types', 'services', 'offer_items'] },
  { key: 'core.unique_offering', sectionId: 'audience_and_goal', title: 'Jedinečnosť ponuky', responseKeys: ['unique_offering'] },
  { key: 'core.key_takeaway', sectionId: 'audience_and_goal', title: 'Hlavná zapamätateľná myšlienka', responseKeys: ['key_takeaway'] },
  { key: 'core.ten_second_highlight', sectionId: 'audience_and_goal', title: 'Prvých desať sekúnd', responseKeys: ['ten_second_highlight'] },
  { key: 'core.sections', sectionId: 'website_content', title: 'Požadované časti stránky', responseKeys: ['sections', 'sections_other'] },
  { key: 'core.future_features', sectionId: 'website_content', title: 'Budúce rozšírenia', responseKeys: ['future_features', 'future_features_other'] },
  { key: 'core.other_sections', sectionId: 'website_content', title: 'Ďalšie požiadavky na obsah', responseKeys: ['other_sections'] },
  { key: 'multi.project_scope', sectionId: 'multi_page', title: 'Typ a rozsah projektu', responseKeys: ['project_scope'] },
  { key: 'multi.content_owner', sectionId: 'multi_page', title: 'Príprava obsahu', responseKeys: ['content_owner'] },
  { key: 'multi.editable_content', sectionId: 'multi_page', title: 'Obsah upravovaný klientom', responseKeys: ['editable_content'] },
  { key: 'multi.content_changes', sectionId: 'multi_page', title: 'Frekvencia zmien obsahu', responseKeys: ['content_changes'] },
  { key: 'multi.languages', sectionId: 'multi_page', title: 'Jazyky webu', responseKeys: ['languages'] },
  { key: 'multi.translation_owner', sectionId: 'multi_page', title: 'Príprava prekladov', responseKeys: ['translation_owner'] },
  { key: 'multi.features', sectionId: 'multi_page', title: 'Požadované funkcie', responseKeys: ['features'] },
  { key: 'multi.features_details', sectionId: 'multi_page', title: 'Fungovanie funkcií', responseKeys: ['features_details'] },
  { key: 'multi.forms_details', sectionId: 'multi_page', title: 'Formuláre a doručovanie správ', responseKeys: ['forms_details'] },
  { key: 'multi.integrations', sectionId: 'multi_page', title: 'Integrácie', responseKeys: ['integrations'] },
  { key: 'multi.product_mode', sectionId: 'multi_page', title: 'Produkty a predaj', responseKeys: ['product_mode'] },
  { key: 'multi.product_count', sectionId: 'multi_page', title: 'Počet a zmeny produktov', responseKeys: ['product_count'] },
  { key: 'multi.product_source', sectionId: 'multi_page', title: 'Zdroj produktových údajov', responseKeys: ['product_source'] },
  { key: 'multi.product_details', sectionId: 'multi_page', title: 'Parametre produktov', responseKeys: ['product_details'] },
  { key: 'multi.shop_url', sectionId: 'multi_page', title: 'Existujúci e-shop', responseKeys: ['shop_url'] },
  { key: 'multi.shop_platform', sectionId: 'multi_page', title: 'Platforma e-shopu', responseKeys: ['shop_platform'] },
  { key: 'multi.checkout_details', sectionId: 'multi_page', title: 'Objednávky, platby, doprava a sklad', responseKeys: ['checkout_details'] },
  { key: 'multi.migration_content', sectionId: 'multi_page', title: 'Prenos obsahu', responseKeys: ['migration_content'] },
  { key: 'multi.migration_urls', sectionId: 'multi_page', title: 'Staré odkazy a presmerovania', responseKeys: ['migration_urls'] },
  { key: 'multi.decision_maker', sectionId: 'multi_page', title: 'Schvaľovanie webu', responseKeys: ['decision_maker'] },
  { key: 'core.brand_first_impression', sectionId: 'visual_direction', title: 'Prvý dojem zo značky', responseKeys: ['brand_first_impression'] },
  { key: 'core.design_preferences', sectionId: 'visual_direction', title: 'Charakter značky', responseKeys: ['design_preferences', 'design_other'] },
  { key: 'core.color_preferences', sectionId: 'visual_direction', title: 'Farebné preferencie', responseKeys: ['color_preferences', 'color_preferences_other'] },
  { key: 'core.design_dislikes', sectionId: 'visual_direction', title: 'Neželaný vizuálny smer', responseKeys: ['design_dislikes', 'dislikes'] },
  { key: 'core.project_constraints', sectionId: 'visual_direction', title: 'Obmedzenia a požiadavky návrhu', responseKeys: ['project_constraints'] },
  { key: 'core.inspiration_urls', sectionId: 'visual_direction', title: 'Vizuálne inšpirácie', responseKeys: ['inspiration_urls'] },
  { key: 'core.representative_photos', sectionId: 'visual_direction', title: 'Fotografie reprezentujúce značku', responseKeys: ['representative_photo_ids'] },
  { key: 'core.collaboration_involvement', sectionId: 'collaboration', title: 'Zapojenie klienta', responseKeys: ['collaboration_involvement'] },
  { key: 'core.desired_completion', sectionId: 'collaboration', title: 'Požadovaný termín dokončenia', responseKeys: ['desired_completion'] },
  { key: 'core.desired_completion_date', sectionId: 'collaboration', title: 'Konkrétny požadovaný dátum', responseKeys: ['desired_completion_date'] },
  { key: 'core.website_management', sectionId: 'collaboration', title: 'Správa webu po spustení', responseKeys: ['website_management'] },
  { key: 'core.feedback_communication', sectionId: 'collaboration', title: 'Komunikácia a spätná väzba', responseKeys: ['feedback_communication'] },
  { key: 'core.contact_name', sectionId: 'contact', title: 'Kontaktná osoba', responseKeys: ['contact_name'] },
  { key: 'core.contact_email', sectionId: 'contact', title: 'Kontaktný e-mail', responseKeys: ['contact_email'] },
  { key: 'core.contact_phone', sectionId: 'contact', title: 'Kontaktný telefón', responseKeys: ['contact_phone'] },
  { key: 'core.preferred_contacts', sectionId: 'contact', title: 'Preferované kontaktné možnosti', responseKeys: ['preferred_contacts', 'preferred_contact'] },
  { key: 'core.business_address', sectionId: 'contact', title: 'Adresa podnikania / prevádzky', responseKeys: ['business_address'] },
  { key: 'core.opening_hours', sectionId: 'contact', title: 'Otváracie hodiny', responseKeys: ['opening_hours'] },
  { key: 'core.billing_company_name', sectionId: 'billing', title: 'Fakturačný názov', responseKeys: ['company_name'] },
  { key: 'core.billing_company_id', sectionId: 'billing', title: 'IČO', responseKeys: ['company_id'] },
  { key: 'core.billing_tax_id', sectionId: 'billing', title: 'DIČ', responseKeys: ['tax_id'] },
  { key: 'core.billing_vat_id', sectionId: 'billing', title: 'IČ DPH', responseKeys: ['vat_id'] },
  { key: 'core.billing_address', sectionId: 'billing', title: 'Fakturačná adresa', responseKeys: ['billing_address'] },
  { key: 'core.additional_notes', sectionId: 'additional_notes', title: 'Ďalšie poznámky klienta', responseKeys: ['additional_notes'] },
  { key: 'discovery.order_methods', sectionId: 'discovery', title: 'Spôsob objednávania', responseKeys: ['order_methods'] },
  { key: 'discovery.products_and_prices', sectionId: 'discovery', title: 'Produkty, služby a ceny', responseKeys: ['products_and_prices'] },
  { key: 'discovery.personalization', sectionId: 'discovery', title: 'Možnosti prispôsobenia', responseKeys: ['personalization_choices'] },
  { key: 'discovery.customer_appreciation', sectionId: 'discovery', title: 'Čo zákazníci oceňujú', responseKeys: ['customer_appreciation_choices'] },
  { key: 'discovery.frequent_questions', sectionId: 'discovery', title: 'Časté otázky zákazníkov', responseKeys: ['frequent_questions'] },
  { key: 'discovery.must_show', sectionId: 'discovery', title: 'Povinný obsah webu', responseKeys: ['must_show_choices'] },
] as const satisfies readonly FieldGroup[]

export type ImplementationFieldKey = typeof implementationFieldGroups[number]['key'] | 'page_structure'

const implementationFieldKeySet = new Set<string>([
  ...implementationFieldGroups.map((field) => field.key),
  'page_structure',
])

export function isImplementationFieldKey(value: unknown): value is ImplementationFieldKey {
  return typeof value === 'string' && implementationFieldKeySet.has(value)
}

export function sanitizeImplementationFieldSelection(value: unknown): ImplementationFieldSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(([key, included]) => implementationFieldKeySet.has(key) && included === true),
  )
}

type ExportResponse = {
  answer: string | string[]
  answered: boolean
  key: string
  question: string
}

type ExportSection = {
  id: string
  responses: ExportResponse[]
  title: string
}

function answerMarkdown(answer: string | string[]) {
  if (Array.isArray(answer)) {
    return answer.length ? answer.map((item) => `- ${item}`).join('\n') : '_Nevyplnené._'
  }
  return answer.trim() || '_Nevyplnené._'
}

function photoUrl(asset: OnboardingAsset, origin?: string) {
  if (!origin || !asset.shareToken || asset.clientVisible !== true) return null
  return new URL(`/subor/${asset.id}/${asset.shareToken}`, origin).toString()
}

function fieldMarkdown(field: FieldGroup, responses: ExportResponse[], workspace: ClientWorkspaceResponse, origin?: string) {
  if (field.key === 'core.representative_photos') {
    const photoIds = workspace.core?.answers.representativePhotoIds || []
    const photos = photoIds.map((id) => workspace.assets.find((asset) => asset.id === id)).filter(Boolean) as OnboardingAsset[]
    const lines = [`### ${field.title}`, '']
    if (!photos.length) return [...lines, '_Nevyplnené._']
    photos.forEach((asset) => {
      const url = photoUrl(asset, origin)
      lines.push(`- **${asset.name}**${url ? ` — ${url}` : ''}`)
    })
    return lines
  }

  const selectedResponses = field.responseKeys
    .map((key) => responses.find((item) => item.key === key))
    .filter(Boolean) as ExportResponse[]
  const answeredResponses = selectedResponses.filter((item) => item.answered)
  const lines = [`### ${field.title}`, '']

  if (!answeredResponses.length) return [...lines, '_Nevyplnené._']
  if (selectedResponses.length === 1) return [...lines, answerMarkdown(selectedResponses[0]!.answer)]

  answeredResponses.forEach((item) => {
    lines.push(`**${item.question}**`, '', answerMarkdown(item.answer), '')
  })
  return lines
}

export function createImplementationDocument(workspace: ClientWorkspaceResponse, origin?: string) {
  const selection = sanitizeImplementationFieldSelection(workspace.implementationFieldSelection)
  const selectedFields = implementationFieldGroups.filter((field) => selection[field.key] === true)
  const exported = createAiClientBrief(workspace)
  const coreForm = exported.forms.find((form) => form.id === 'basic_form') as unknown as { sections: ExportSection[] } | undefined
  const discoveryForm = exported.forms.find((form) => form.id === 'additional_questions') as unknown as { responses: ExportResponse[] } | undefined
  const lines = [
    '# Implementačné zadanie webu',
    '',
    `**Projekt:** ${workspace.clientLabel.trim() || 'Neuvedený'}`,
    `**Vybraných podkladov:** ${selectedFields.length + (selection.page_structure === true ? 1 : 0)}`,
    ...(workspace.assetsLocalPath.trim() ? [
      `**Lokálny priečinok assets:** ${workspace.assetsLocalPath.trim()}`,
      '**Pravidlo vyhľadávania:** Súbory hľadaj rekurzívne podľa názvu. Najprv porovnaj presný názov po Unicode NFC normalizácii, potom prípadne bez rozlíšenia veľkosti písmen. Pri viacerých zhodách použi náhľad.',
    ] : []),
    '',
    '## Pravidlá implementácie',
    '',
    '- Dokument obsahuje iba údaje označené správcom ako relevantné pre finálnu implementáciu.',
    '- Zachovaj význam odpovedí a nevymýšľaj chýbajúce fakty, texty, funkcie ani obchodné tvrdenia.',
    '- Ak je označený údaj nevyplnený alebo nejednoznačný, eviduj ho ako otvorenú otázku.',
    '- Priradené fotografie používaj iba v určenom kontexte a podľa uvedeného popisu.',
  ]

  for (const section of coreForm?.sections || []) {
    const fields = selectedFields.filter((field) => field.sectionId === section.id)
    if (!fields.length) continue
    lines.push('', `## ${section.title}`, '')
    fields.forEach((field) => lines.push(...fieldMarkdown(field, section.responses, workspace, origin), ''))
  }

  const discoveryFields = selectedFields.filter((field) => field.sectionId === 'discovery')
  if (discoveryFields.length) {
    lines.push('', '## Doplňujúce otázky', '')
    discoveryFields.forEach((field) => lines.push(...fieldMarkdown(field, discoveryForm?.responses || [], workspace, origin), ''))
  }

  if (selection.page_structure === true) {
    lines.push('', workspace.onboardingType === 'multi_page_website' ? '## Mapa webu' : '## Štruktúra stránky', '')
    lines.push(createPageStructureSectionsMarkdown({
      assets: workspace.assets,
      assetsLocalPath: workspace.assetsLocalPath,
      headingLevel: 3,
      origin,
      structure: workspace.pageStructure?.data || { sections: [] },
    }))
  }

  return lines.join('\n').trimEnd()
}
