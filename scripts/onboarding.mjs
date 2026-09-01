import { readdir, readFile } from 'node:fs/promises'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import nextEnv from '@next/env'
import postgres from 'postgres'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const command = process.argv[2]

if (!process.env.DATABASE_URL) {
  if (command === 'migrate-if-configured') {
    console.log('DATABASE_URL nie je nastavené; automatická migrácia sa preskakuje.')
    process.exit(0)
  }
  console.error('Chýba DATABASE_URL v .env.local.')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
})

try {
  if (command === 'migrate' || command === 'migrate-if-configured') {
    const migrationsUrl = new URL('../migrations/', import.meta.url)
    const migrations = (await readdir(migrationsUrl))
      .filter((name) => /^\d+.*\.sql$/.test(name))
      .sort()
    await sql.begin(async (transaction) => {
      await transaction`select pg_advisory_xact_lock(hashtext('webkastart-onboarding-migrations'))`
      await transaction`
        create table if not exists onboarding_schema_migrations (
          name text primary key,
          applied_at timestamptz not null default now()
        )
      `

      for (const name of migrations) {
        const applied = await transaction`
          select name from onboarding_schema_migrations where name = ${name}
        `
        if (applied[0]) continue

        const migration = await readFile(new URL(name, migrationsUrl), 'utf8')
        await transaction.unsafe(migration)
        await transaction`insert into onboarding_schema_migrations (name) values (${name})`
        console.log(`Migrácia ${name} je pripravená.`)
      }
    })
    console.log('Onboarding databáza je pripravená.')
  } else if (command === 'create') {
    const clientLabel = process.argv.slice(3).join(' ').trim()
    if (!clientLabel) throw new Error('Použitie: pnpm onboarding:create -- "Názov klienta"')

    const token = randomBytes(32).toString('base64url')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const clientId = randomUUID()
    const [project] = await sql.begin(async (transaction) => {
      await transaction`
        insert into clients (id, display_name) values (${clientId}, ${clientLabel})
      `
      return transaction`
        insert into onboarding_projects (id, client_id, client_label, token_hash)
        values (${clientId}, ${clientId}, ${clientLabel}, ${tokenHash})
        returning id, created_at as "createdAt"
      `
    })
    const siteUrl = (process.env.SITE_URL || 'https://webkastart.sk').replace(/\/$/, '')

    console.log(`Klient: ${clientLabel}`)
    console.log(`Projekt ID: ${project.id}`)
    console.log(`Osobný link: ${siteUrl}/start/${token}`)
    console.log('Link si teraz bezpečne uložte; v databáze je iba jeho hash.')
  } else if (command === 'list') {
    const rows = await sql`
      select client.id, client.display_name, core.status, core.current_step,
        client.created_at, core.last_activity_at, core.submitted_at
      from clients as client
      join onboarding_projects as core on core.client_id = client.id
      order by client.created_at desc
    `
    console.table(rows)
  } else if (command === 'show') {
    const projectId = process.argv[3]
    if (!/^[0-9a-f-]{36}$/i.test(projectId || '')) {
      throw new Error('Použitie: pnpm onboarding:show -- <project-id>')
    }
    const [project] = await sql`
      select id, client_label, status, current_step, answers, created_at, updated_at, submitted_at
      from onboarding_projects where client_id = ${projectId}
    `
    if (!project) throw new Error('Projekt sa nenašiel.')
    const assets = await sql`
      select id, original_filename, mime_type, size, status, storage_key, uploaded_at
      from onboarding_assets where client_id = ${projectId} order by created_at
    `
    console.log(JSON.stringify({ ...project, assets }, null, 2))
  } else {
    throw new Error('Použite: migrate, create, list alebo show.')
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
