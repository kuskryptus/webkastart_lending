# Team Go booking API

The public booking link is `https://webkastart.sk/rezervacia`. Website bookings
are stored in PostgreSQL and are available to Team Go through the API below.
All timestamps use ISO 8601 UTC. Display them in the user's local time zone.

## Authentication

Set the same private `BOOKING_API_KEY` in the WebkaStart deployment and Team Go.
Send it with every request:

```http
Authorization: Bearer YOUR_BOOKING_API_KEY
```

Do not put this key in a public browser bundle. A server, Electron or Tauri process
can call the API directly. For a browser-only local app, add its exact origin to
`TEAM_GO_ALLOWED_ORIGINS`.

## Read and synchronize bookings

```http
GET https://webkastart.sk/api/team-go/bookings?from=2026-09-01T00:00:00Z&to=2027-01-01T00:00:00Z
```

Optional query parameters:

- `status=confirmed` or `status=cancelled`; omit it to receive both.
- `updatedSince=<ISO timestamp>` for incremental synchronization.
- `limit=1..500`, default `200`.

The response contains `bookings` and `nextUpdatedSince`. Save
`nextUpdatedSince` and use it as `updatedSince` on the next sync. Booking fields:
`id`, `name`, `email`, `phone`, `company`, `note`, `startsAt`, `endsAt`,
`status`, `source`, `externalId`, `createdAt`, and `updatedAt`.

```bash
curl 'https://webkastart.sk/api/team-go/bookings?status=confirmed' \
  -H 'Authorization: Bearer YOUR_BOOKING_API_KEY'
```

## Create a booking from Team Go

`externalId` is optional but recommended. Repeating a request with the same value
returns the already-created booking instead of making a duplicate.

```bash
curl -X POST 'https://webkastart.sk/api/team-go/bookings' \
  -H 'Authorization: Bearer YOUR_BOOKING_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "externalId": "team-go-123",
    "name": "Ján Novák",
    "email": "jan@example.sk",
    "phone": "+421900000000",
    "company": "Firma s.r.o.",
    "note": "Úvodná konzultácia",
    "startsAt": "2026-09-21T08:00:00Z"
  }'
```

The start must match one of the currently available configured slots. A collision
returns HTTP `409`; an invalid slot returns `422`.

## Cancel or restore a booking

```bash
curl -X PATCH 'https://webkastart.sk/api/team-go/bookings/BOOKING_UUID' \
  -H 'Authorization: Bearer YOUR_BOOKING_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"status":"cancelled"}'
```

Use `{"status":"confirmed"}` to restore it. A restore can fail if another
confirmed booking already occupies the slot.
