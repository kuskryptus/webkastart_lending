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

Onboarding potrebuje PostgreSQL databázu a privátny S3-kompatibilný bucket. Všetky
premenné sú uvedené v `.env.example`. Bucket nesmie mať zapnuté verejné čítanie.

Pred prvým použitím spusti migráciu:

```bash
pnpm onboarding:migrate
```

Vytvorenie osobného linku pre klienta:

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

S3/R2 bucket musí povoliť CORS `PUT` požiadavky z domény webu s hlavičkou
`Content-Type`. Upload ide priamo z prehliadača cez URL platnú 10 minút. Aplikácia
po uploade server-side overí existenciu, veľkosť, deklarovaný MIME typ aj podpis
formátu v obsahu objektu. Objektové kľúče obsahujú iba náhodné UUID; pôvodné názvy
sú uložené samostatne v databáze.

Odporúčané limity reverse proxy pre malé JSON API môžu zostať nízke. Samotné súbory
cez nginx ani Next.js neprechádzajú. Maximálne je podporovaných 100 súborov po 50 MB.
