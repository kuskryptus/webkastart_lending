# Deployment

Kontaktný formulár používa Next.js route handler `POST /api/contact`.
Preto web nemôže byť nasadený iba ako statické HTML súbory cez nginx.

## Environment

Na serveri vytvor `.env.local`:

```env
RESEND_API_KEY=tvoj_resend_api_kluc
CONTACT_TO_EMAIL=kontakt@webkastart.sk
CONTACT_FROM_EMAIL="WebkaStart <kontakt@webkastart.sk>"
```

`CONTACT_FROM_EMAIL` musí byť email z domény overenej v Resende.

## Spustenie Next.js servera

```bash
pnpm install
pnpm build
pnpm start
```

Next.js potom počúva napríklad na `http://127.0.0.1:3000`.

## nginx reverse proxy

Namiesto servovania statických súborov nastav nginx, aby proxyoval celý web do Next.js:

```nginx
server {
  server_name webkastart.sk www.webkastart.sk;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Ak nginx vracia `405 Not Allowed` pri odoslaní formulára, znamená to, že request na `/api/contact` nejde do Next.js servera.

## Klientsky onboarding

Onboarding potrebuje PostgreSQL databázu. Vyplnený Core dotazník sa pri odoslaní
pošle cez Resend na `CONTACT_TO_EMAIL`. Discovery 2 sa ukladá samostatne podľa
`client_id`; pôvodné Core odpovede sa migráciou nemenia.

Po každom nasadení spusti migrácie. Runner vykoná všetky SQL súbory v priečinku
`migrations/` v poradí; príkazy sú pripravené na opakované spustenie:

```bash
pnpm onboarding:migrate
```

Vytvorenie osobného linku pre klienta:

Po nasadení otvorte `https://webkastart.sk/start`, prihláste sa hodnotou
`ONBOARDING_ADMIN_SECRET`, napíšte názov klienta a kliknite na „Vytvoriť link“.
Toto je odporúčaný bežný spôsob.

Alternatívne je možné link vytvoriť aj príkazom:

```bash
pnpm onboarding:create -- "Názov klienta alebo projektu"
```

Príkaz vypíše jediný osobný link. V databáze sa ukladá iba SHA-256 hash 256-bitového
náhodného tokenu, preto si link po vytvorení bezpečne ulož. Interný prehľad a export
štruktúrovaných odpovedí:

```bash
pnpm onboarding:list
pnpm onboarding:show -- <project-id>
```

## S3-compatible úložisko

Pre viacnásobné nahrávanie fotografií a dokumentov nastav:

```env
S3_ENDPOINT=https://...
S3_REGION=auto
S3_BUCKET=webkastart-client-assets
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_FORCE_PATH_STYLE=false
S3_PUBLIC_URL=
```

Bucket nesmie mať zapnuté verejné čítanie. Musí povoliť CORS `PUT` z domény webu
s hlavičkou `Content-Type`. Frontend nikdy nedostane access keys, iba krátkodobý
presigned upload URL. Súbory sa ukladajú pod
`clients/{client_id}/uploads/{uuid}-{bezpecny-nazov}`; databáza uchováva len
metadata a `storage_key`. Galéria v administrácii používa krátkodobé podpísané URL.
