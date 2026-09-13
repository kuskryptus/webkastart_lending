import 'server-only'

import type { BookingRecord } from './types'

const contactEmail = process.env.CONTACT_TO_EMAIL || 'kampczykristian@gmail.com'
const fromEmail = process.env.CONTACT_FROM_EMAIL || 'WebkaStart <kontakt@webkastart.sk>'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatBookingDate(date: Date) {
  return new Intl.DateTimeFormat('sk-SK', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: process.env.BOOKING_TIME_ZONE || 'Europe/Bratislava',
  }).format(date)
}

async function sendEmail(input: { to: string; subject: string; text: string; html: string }) {
  if (!process.env.RESEND_API_KEY) return
  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({ from: fromEmail, ...input }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok) throw new Error(`Booking email failed with ${response.status}`)
}

export async function sendBookingEmails(booking: BookingRecord) {
  if (!process.env.RESEND_API_KEY) return false

  const date = formatBookingDate(booking.startsAt)
  const safeName = escapeHtml(booking.name)
  const safeEmail = escapeHtml(booking.email)
  const safePhone = escapeHtml(booking.phone)
  const safeCompany = escapeHtml(booking.company)
  const safeNote = escapeHtml(booking.note).replaceAll('\n', '<br />')

  const ownerText = [
    `Nová rezervácia: ${date}`,
    `Meno: ${booking.name}`,
    `Email: ${booking.email}`,
    booking.phone ? `Telefón: ${booking.phone}` : null,
    booking.company ? `Firma: ${booking.company}` : null,
    booking.note ? `Poznámka: ${booking.note}` : null,
  ].filter(Boolean).join('\n')

  const results = await Promise.allSettled([
    sendEmail({
      to: contactEmail,
      subject: `Nová rezervácia — ${booking.name}`,
      text: ownerText,
      html: `<h2>Nová rezervácia konzultácie</h2><p><strong>Termín:</strong> ${date}</p><p><strong>Meno:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p>${booking.phone ? `<p><strong>Telefón:</strong> ${safePhone}</p>` : ''}${booking.company ? `<p><strong>Firma:</strong> ${safeCompany}</p>` : ''}${booking.note ? `<p><strong>Poznámka:</strong><br />${safeNote}</p>` : ''}`,
    }),
    sendEmail({
      to: booking.email,
      subject: 'Potvrdenie rezervácie — WebkaStart',
      text: `Dobrý deň ${booking.name},\n\ntermín konzultácie máte rezervovaný na ${date}.\n\nAk potrebujete termín zmeniť, odpovedzte na tento email.\n\nWebkaStart`,
      html: `<h2>Termín je rezervovaný</h2><p>Dobrý deň ${safeName},</p><p>konzultáciu máte rezervovanú na <strong>${date}</strong>.</p><p>Ak potrebujete termín zmeniť, odpovedzte na tento email.</p><p>WebkaStart</p>`,
    }),
  ])

  for (const result of results) {
    if (result.status === 'rejected') console.error('[booking:email]', result.reason)
  }
  return results[1]?.status === 'fulfilled'
}
