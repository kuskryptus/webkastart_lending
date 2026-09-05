import type { OnboardingAnswers, OnboardingAsset } from './types'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function value(value: string | string[]) {
  const text = Array.isArray(value) ? value.filter(Boolean).join(', ') : value
  return text || '—'
}

export function createOnboardingEmail(clientLabel: string, answers: OnboardingAnswers, assets: OnboardingAsset[] = []) {
  const representativePhotoNames = answers.representativePhotoIds
    .map((id) => assets.find((asset) => asset.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  const groups: Array<{ title: string; rows: Array<[string, string | string[]]> }> = [
    {
      title: 'Klient a podnikanie',
      rows: [
        ['Klient / projekt', clientLabel],
        ['Meno alebo názov podnikania', answers.client.displayName],
        ['Oblasť podnikania', answers.business.area],
        ['Typ projektu', answers.projectType],
        ['Opis práce', answers.business.description],
        ['Predchádzajúce skúsenosti s webom', answers.previousWebsiteExperience],
        ['Existujúci web', answers.existingWebsite],
        ['Platformy sociálnych sietí', answers.socialPlatforms],
        ['Sociálne siete', answers.socialLinks],
      ],
    },
    {
      title: 'Cieľ webu',
      rows: [
        ['Typy zákazníkov', answers.targetAudienceSelections],
        ['Cieľová skupina', answers.targetAudience],
        ['Očakávania od webu', answers.websiteExpectations],
        ['Iné očakávanie', answers.websiteExpectationsOther],
        ['Prečo je cieľ dôležitý', answers.goalImportance],
        ['Ako klient spozná úspech webu', answers.successCriteria],
        ['Najdôležitejšie priority webu', answers.websitePriorities],
        ['Skúsenosti so zákazníkmi', answers.customerInsights],
        ['Čo má návštevník urobiť', answers.desiredActions],
        ['Iná akcia', answers.desiredActionsOther],
        ['Čo sa má návštevník dozvedieť', answers.websiteInformation],
        ['Čo sa má dozvedieť', answers.websiteGoal],
        ['Typ ponuky', answers.offeringTypes],
        ['Konkrétne produkty / služby', answers.offerItems],
        ['Služby', answers.services],
        ['Čo je na ponuke jedinečné', answers.uniqueOffering],
        ['Čo si má návštevník zapamätať', answers.keyTakeaway],
        ['Čo ukázať počas prvých 10 sekúnd', answers.tenSecondHighlight],
      ],
    },
    {
      title: 'Obsah a budúcnosť',
      rows: [
        ['Časti webu', answers.sections],
        ['Iná časť webu', answers.sectionsOther],
        ['Ďalšie časti', answers.otherSections],
        ['Budúce rozšírenia', answers.futureFeatures],
        ['Iné budúce rozšírenie', answers.futureFeaturesOther],
      ],
    },
    {
      title: 'Vizuálny smer',
      rows: [
        ['Pocit pri návšteve stránky', answers.designPreferences],
        ['Iný pocit', answers.designOther],
        ['Farebné preferencie', answers.colorPreferences],
        ['Iná farebná preferencia', answers.colorPreferencesOther],
        ['Inšpirácie', answers.inspirationUrls],
        ['Čomu sa má dizajn vyhnúť', answers.designDislikes],
        ['Čomu sa vyhnúť', answers.dislikes],
        ['Reprezentatívne fotografie', representativePhotoNames],
        ['Obmedzenia a súvislosti', answers.projectConstraints],
      ],
    },
    {
      title: 'Príbeh značky',
      rows: [['Osobný príbeh značky', answers.brandStory]],
    },
    {
      title: 'Spolupráca',
      rows: [
        ['Zapojenie klienta do návrhu', answers.collaborationInvolvement],
        ['Komunikácia a spätná väzba', answers.feedbackCommunication],
      ],
    },
    {
      title: 'Kontakt',
      rows: [
        ['Kontaktná osoba', answers.contact.name],
        ['E-mail', answers.contact.email],
        ['Telefón', answers.contact.phone],
        ['Ideálny kontakt zákazníka', answers.contact.preferredMethods],
        ['Preferovaný kontakt', answers.contact.preferredMethod],
      ],
    },
    {
      title: 'Fakturačné údaje',
      rows: [
        ['Firma', answers.billing.companyName],
        ['IČO', answers.billing.companyId],
        ['DIČ', answers.billing.taxId],
        ['IČ DPH', answers.billing.vatId],
        ['Adresa', answers.billing.address],
      ],
    },
    {
      title: 'Poznámka',
      rows: [['Dôležité informácie navyše', answers.additionalNotes]],
    },
  ]

  const text = groups
    .flatMap((group) => [
      group.title.toUpperCase(),
      ...group.rows.map(([label, rowValue]) => `${label}: ${value(rowValue)}`),
      '',
    ])
    .join('\n')
    .trim()

  const html = `
    <div style="font-family:Arial,sans-serif;color:#171717;line-height:1.55;max-width:720px">
      <p style="color:#6b7280;margin:0 0 8px">Nový klientsky onboarding</p>
      <h1 style="font-size:24px;margin:0 0 28px">${escapeHtml(clientLabel)}</h1>
      ${groups.map((group) => `
        <h2 style="font-size:16px;margin:28px 0 10px">${escapeHtml(group.title)}</h2>
        <table style="border-collapse:collapse;width:100%">
          ${group.rows.map(([label, rowValue]) => `
            <tr>
              <td style="vertical-align:top;padding:6px 18px 6px 0;color:#6b7280;width:190px">${escapeHtml(label)}</td>
              <td style="vertical-align:top;padding:6px 0;white-space:pre-wrap">${escapeHtml(value(rowValue))}</td>
            </tr>
          `).join('')}
        </table>
      `).join('')}
    </div>
  `

  return {
    html,
    subject: `Nový onboarding – ${clientLabel}`,
    text,
  }
}
