# MOTIVEX 1.0-1

MOTIVEX is a Korean-language HTS-style web app for trading and portfolio workflows. This repository contains the current Next.js application: landing page, auth flows, trading dashboard, legal pages, shared UI components, and Supabase-backed server/client helpers.

> Status: active development

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase
- Tailwind CSS v4
- shadcn/ui-inspired components
- Vercel Analytics

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer
- A Supabase project
- Optional: market API credentials for live integrations

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs at `http://localhost:3000`.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm test:coverage
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you need.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Public app URL, usually `http://localhost:3000` in dev |
| `ENCRYPTION_KEY` | 32+ byte secret for encrypting broker or exchange credentials |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Optional AWS credentials |
| `AWS_REGION` | Optional AWS region |
| `KIS_APP_KEY` / `KIS_APP_SECRET` | Optional Korea Investment & Securities API credentials |
| `UPBIT_ACCESS_KEY` / `UPBIT_SECRET_KEY` | Optional Upbit API credentials |
| `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` / `ALPACA_BASE_URL` | Optional Alpaca API credentials |

Live market credentials are optional during local development. Mock or fallback behavior is used where available.

## Project Structure

```text
app/
  page.tsx                Home page
  layout.tsx              Root layout and metadata
  auth/                   Login, signup, callback, recovery flows
  trading/                Trading dashboard and nested layout
  privacy/                Privacy policy page
  risk/                   Risk disclosure page
  terms/                  Terms page
components/
  trading/                Trading UI blocks
  ui/                     Shared UI primitives
hooks/                    Shared React hooks
lib/
  crypto/                 Encryption helpers
  security/               Security helpers such as rate limiting
  services/               App service utilities
  stores/                 State management stores
  supabase/               Supabase client helpers
public/                   Static assets and icons
scripts/                  SQL schema setup scripts
styles/                   Global styles
```

## Notes

- The repo currently uses Supabase for auth and app data helpers.
- `scripts/001_create_hts_schema.sql` contains the SQL schema bootstrap script.
- `next.config.mjs` keeps image optimization disabled for the current setup.

## License

TBD.
