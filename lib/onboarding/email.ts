import type { OnboardingAnswers } from './types'

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

export function createOnboardingEmail(clientLabel: string, answers: OnboardingAnswers) {
  const groups: Array<{ title: string; rows: Array<[string, string | string[]]> }> = [
    {
      title: 'Klient a podnikanie',
      rows: [
        ['Klient / projekt', clientLabel],
        ['Meno alebo názov podnikania', answers.client.displayName],
        ['Oblasť podnikania', answers.business.area],
        ['Opis práce', answers.business.description],
        ['Existujúci web', answers.existingWebsite],
        ['Sociálne siete', answers.socialLinks],
      ],
    },
    {
      title: 'Cieľ webu',
      rows: [
        ['Cieľová skupina', answers.targetAudience],
        ['Čo má návštevník urobiť', answers.desiredActions],
        ['Čo sa má dozvedieť', answers.websiteGoal],
        ['Služby', answers.services],
      ],
    },
    {
      title: 'Obsah a budúcnosť',
      rows: [
        ['Časti webu', answers.sections],
        ['Ďalšie časti', answers.otherSections],
        ['Budúce rozšírenia', answers.futureFeatures],
      ],
    },
    {
      title: 'Vizuálny smer',
      rows: [
        ['Preferovaný štýl', answers.designPreferences],
        ['Vlastný opis štýlu', answers.designOther],
        ['Inšpirácie', answers.inspirationUrls],
        ['Čomu sa vyhnúť', answers.dislikes],
      ],
    },
    {
      title: 'Kontakt',
      rows: [
        ['Kontaktná osoba', answers.contact.name],
        ['E-mail', answers.contact.email],
        ['Telefón', answers.contact.phone],
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
      rows: [['Ďalšie informácie', answers.additionalNotes]],
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
