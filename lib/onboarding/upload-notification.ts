import 'server-only'

import { createHash } from 'node:crypto'
import { getDatabase } from './db'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2).replace('.', ',')} GB`
}

function fileCountLabel(count: number) {
  if (count === 1) return '1 súbor'
  if (count >= 2 && count <= 4) return `${count} súbory`
  return `${count} súborov`
}

export async function sendUploadNotification(options: {
  assetIds: unknown
  clientId: string
  requestOrigin: string
}) {
  const assetIds = Array.isArray(options.assetIds)
    ? [...new Set(options.assetIds)]
      .filter((value): value is string => typeof value === 'string' && UUID_PATTERN.test(value))
      .slice(0, 100)
      .sort()
    : []
  if (!assetIds.length) return { error: 'Chýba zoznam nahraných súborov.', status: 422 } as const

  const sql = getDatabase()
  const clients = await sql<{ label: string }[]>`
    select display_name as label from clients where id = ${options.clientId} limit 1
  `
  const client = clients[0]
  if (!client) return { error: 'Klient sa nenašiel.', status: 404 } as const

  const assets = await sql<{ id: string; name: string; size: number }[]>`
    select id, original_filename as name, size::float8 as size
    from onboarding_assets
    where client_id = ${options.clientId} and uploaded_by = 'client' and status = 'uploaded'
      and id = any(${sql.array(assetIds)}::uuid[])
    order by created_at asc
  `
  if (!assets.length) return { error: 'Nahrané súbory sa nenašli.', status: 404 } as const

  if (!process.env.RESEND_API_KEY) {
    console.warn('[onboarding] Upload notification skipped because RESEND_API_KEY is not configured')
    return { ok: true, notification: 'skipped' as const }
  }

  const siteUrl = (process.env.SITE_URL || options.requestOrigin).replace(/\/$/, '')
  const adminUrl = `${siteUrl}/start/admin/${options.clientId}#files`
  const totalSize = assets.reduce((sum, asset) => sum + Number(asset.size), 0)
  const countLabel = fileCountLabel(assets.length)
  const filesText = assets.map((asset) => `- ${asset.name} (${formatBytes(Number(asset.size))})`).join('\n')
  const text = [
    `Klient ${client.label} nahral nové podklady.`,
    '',
    `${countLabel} · spolu ${formatBytes(totalSize)}`,
    filesText,
    '',
    `Bezpečné stiahnutie v administrácii: ${adminUrl}`,
    '',
    'Súbory sú uložené v pôvodnej kvalite. Nie sú priložené k tomuto e-mailu.',
  ].join('\n')
  const html = `
    <div style="font-family:Arial,sans-serif;color:#171717;line-height:1.55;max-width:680px">
      <p style="color:#6b7280;margin:0 0 8px">Nové klientské podklady</p>
      <h1 style="font-size:24px;margin:0 0 12px">${escapeHtml(client.label)}</h1>
      <p style="margin:0 0 24px"><strong>${countLabel}</strong> · spolu ${formatBytes(totalSize)}</p>
      <table style="border-collapse:collapse;width:100%;margin:0 0 28px">
        ${assets.map((asset) => `
          <tr>
            <td style="padding:8px 16px 8px 0;border-bottom:1px solid #e5e7eb">${escapeHtml(asset.name)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;text-align:right;white-space:nowrap">${formatBytes(Number(asset.size))}</td>
          </tr>
        `).join('')}
      </table>
      <p style="margin:0 0 24px"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Otvoriť a stiahnuť súbory</a></p>
      <p style="font-size:13px;color:#6b7280;margin:0">Súbory sú bezpečne uložené v pôvodnej kvalite. Odkaz vedie do chránenej administrácie.</p>
    </div>
  `
  const notificationHash = createHash('sha256')
    .update(`${options.clientId}:${assets.map((asset) => asset.id).sort().join(',')}`)
    .digest('hex')
    .slice(0, 32)
  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'WebkaStart <kontakt@webkastart.sk>',
      html,
      subject: `Nové súbory od klienta – ${client.label}`,
      text,
      to: [process.env.CONTACT_TO_EMAIL || 'kampczykristian@gmail.com'],
    }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `upload-notification-${notificationHash}`,
    },
    method: 'POST',
  })
  if (!response.ok) {
    console.error('[onboarding] Resend rejected upload notification', response.status, await response.text())
    return { error: 'E-mailové upozornenie sa nepodarilo odoslať.', status: 502 } as const
  }
  return { ok: true, notification: 'sent' as const }
}
