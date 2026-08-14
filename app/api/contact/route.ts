const contactEmail = process.env.CONTACT_TO_EMAIL || 'kontakt@webkastart.sk'
const fromEmail = process.env.CONTACT_FROM_EMAIL || 'WebkaStart <kontakt@webkastart.sk>'

type ContactPayload = {
  email?: unknown
  message?: unknown
  name?: unknown
  phone?: unknown
  website?: unknown
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function POST(request: Request) {
  let payload: ContactPayload

  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  if (cleanText(payload.website, 100)) {
    return Response.json({ ok: true })
  }

  const name = cleanText(payload.name, 120)
  const email = cleanText(payload.email, 160)
  const phone = cleanText(payload.phone, 60)
  const message = cleanText(payload.message, 3000)

  if (!name || !email || !message) {
    return Response.json({ error: 'Vyplň meno, email a správu.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Zadaj platný email.' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: 'Email služba ešte nie je nakonfigurovaná.', reason: 'not_configured' },
      { status: 503 },
    )
  }

  const subject = `Dopyt z webu - ${name}`
  const text = [
    `Meno: ${name}`,
    `Email: ${email}`,
    phone ? `Telefón: ${phone}` : null,
    '',
    'Správa:',
    message,
  ].filter(Boolean).join('\n')
  const html = `
    <h2>Nový dopyt z webu</h2>
    <p><strong>Meno:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Telefón:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Správa:</strong></p>
    <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
  `

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: fromEmail,
      html,
      subject,
      text,
      to: [contactEmail],
    }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    return Response.json(
      { error: 'Správu sa nepodarilo odoslať. Skús to prosím znova.' },
      { status: 502 },
    )
  }

  return Response.json({ ok: true })
}
