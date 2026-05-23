# Starliar

Cinematic unisex fashion commerce for Starliar, built around a full-bleed brand
video, product storefront, cart, QR-first checkout boundary, and basic admin
operations.

## Local Setup

This workspace currently uses a local Node runtime in `.tools/` because the
machine shell did not include `npm`.

```bash
export PATH="$PWD/.tools/node-v24.11.1-darwin-arm64/bin:$PATH"
npm install
cp .env.example .env
npx prisma generate
npm run db:setup
npm run dev
```

The app runs at `http://localhost:3000`.

## Admin

Seeded credentials come from `.env`:

- Email: `admin@starliar.local`
- Password: `change-this-password`

Change these before any real deployment.

## Payment Notes

payOS is wired as the first QR payment provider. Without merchant credentials,
checkout creates the order and stores a pending payment row, then returns to the
local order page. With real `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, and
`PAYOS_CHECKSUM_KEY`, checkout redirects to payOS and the webhook route at
`/api/payments/payos/webhook` verifies callbacks before marking payments paid.

## Verification

```bash
npm run lint
npm run build
npx vitest run
```

Playwright config is present for browser flows; install browsers if needed with
`npx playwright install`.
