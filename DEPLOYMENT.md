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

Onboarding potrebuje PostgreSQL databázu. Vyplnený dotazník sa pri odoslaní pošle
cez Resend na `CONTACT_TO_EMAIL`. Súbory klient odošle samostatne e-mailom cez
tlačidlo v piatom kroku, preto S3 premenné v tomto dočasnom režime nie sú potrebné.

Pred prvým použitím spusti migráciu:

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

S3/R2 integrácia zostáva v projekte pripravená na neskoršie zapnutie. Bucket potom
musí povoliť CORS `PUT` požiadavky z domény webu s hlavičkou `Content-Type` a nesmie
mať zapnuté verejné čítanie.
