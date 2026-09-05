import { createHash } from 'node:crypto'
import { checkRateLimit, findOnboardingByToken, listAssets, submitOnboarding } from '@/lib/onboarding/db'
import { createOnboardingEmail } from '@/lib/onboarding/email'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { sanitizeAnswers, validateContact } from '@/lib/onboarding/validation'
import { reconcileClientMetadata } from '@/lib/onboarding/prefill'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'

type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'core')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Tento formulár nie je možné odoslať.' }, { status: 403 })
    }

    const allowed = await checkRateLimit({
      action: 'submit',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 10,
    })
    if (!allowed) {
      return privateJson({ error: 'Príliš veľa pokusov. Skúste to o chvíľu.' }, { status: 429 })
    }

    let payload: unknown
    try {
      payload = await readSmallJson(request)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }

    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const revision = Number(body.revision)
    if (!Number.isSafeInteger(revision) || revision < 1) {
      return privateJson({ error: 'Obnovte stránku a skúste odoslanie znova.' }, { status: 422 })
    }
    if (revision !== project.revision) {
      return privateJson({ error: 'Údaje sa medzitým zmenili. Obnovte stránku.', reason: 'conflict' }, { status: 409 })
    }
    const answers = reconcileClientMetadata(
      sanitizeAnswers(project.answers),
      sanitizeAnswers(body.answers),
    )
    const errors = validateContact(answers)
    if (Object.keys(errors).length) {
      return privateJson({ error: 'Doplňte prosím kontaktné údaje.', fields: errors }, { status: 422 })
    }

    if (!process.env.RESEND_API_KEY) {
      return privateJson(
        { error: 'Odosielanie e-mailu ešte nie je nakonfigurované.', reason: 'not_configured' },
        { status: 503 },
      )
    }

    const recipient = process.env.CONTACT_TO_EMAIL || 'kampczykristian@gmail.com'
    const sender = process.env.CONTACT_FROM_EMAIL || 'WebkaStart <kontakt@webkastart.sk>'
    const assets = await listAssets(project.clientId)
    const email = createOnboardingEmail(project.clientLabel, answers, assets)
    const answersHash = createHash('sha256').update(JSON.stringify(answers)).digest('hex').slice(0, 20)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify({
        from: sender,
        html: email.html,
        reply_to: answers.contact.email,
        subject: email.subject,
        text: email.text,
        to: [recipient],
      }),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `onboarding-${project.id}-${answersHash}`,
      },
      method: 'POST',
    })

    if (!emailResponse.ok) {
      console.error('[onboarding] Resend rejected the submission', emailResponse.status, await emailResponse.text())
      return privateJson(
        { error: 'Podklady sa nepodarilo odoslať e-mailom. Skúste to prosím znova.' },
        { status: 502 },
      )
    }

    const saved = await submitOnboarding(project.id, answers, revision)
    if (!saved) return privateJson({ error: 'Údaje sa medzitým zmenili. Obnovte stránku.', reason: 'conflict' }, { status: 409 })
    return privateJson({ ok: true, revision: saved.revision })
  } catch (error) {
    return apiError(error)
  }
}
