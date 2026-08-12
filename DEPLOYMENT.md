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
