# Starlier

Cinematic unisex fashion commerce for Starlier, built around a full-bleed brand
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

Starlier now expects PostgreSQL for local and production data. Before running
`npm run db:setup`, set `DATABASE_URL` in `.env` to a reachable database, for
example:

```env
DATABASE_URL="postgresql://starliar:starliar@localhost:5432/starliar?schema=public"
```

For production, use a managed PostgreSQL database, run `npm run db:deploy`, then
seed only the data you actually want available in the live store.

## Admin

Seeded credentials come from `.env`:

- Email: `admin@starliar.local`
- Password: `change-this-password`

Change these before any real deployment.

## Payment Notes

SePay is wired as the QR payment provider. Checkout creates the order, stores a
pending `sepay` payment row, and returns to the order page with a dynamic VietQR
image. Configure these variables locally and on Vercel:

```env
SEPAY_BANK_NAME="ACB"
SEPAY_ACCOUNT_NUMBER="23965057"
SEPAY_ACCOUNT_HOLDER="NGO QUY KHANG"
SEPAY_WEBHOOK_SECRET=""
SEPAY_API_KEY=""
```

The webhook endpoint is `/api/payments/sepay/webhook`. Use HMAC-SHA256 in SePay
when possible and set `SEPAY_WEBHOOK_SECRET` to the same value. If you choose API
Key authentication instead, set `SEPAY_API_KEY`.

The older payOS provider code is still present, but checkout now uses SePay.

## Verification

```bash
npm run lint
npm run build
npx vitest run
```

Playwright config is present for browser flows; install browsers if needed with
`npx playwright install`.
