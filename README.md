# ProductList

Monorepo for Telegram Bot, Telegram Mini App, backend API, product database, barcode generation, Excel export, and PDF export.

## Structure

- `apps/backend` — Express, Prisma, Telegraf, exports, barcode services
- `apps/web` — React + Vite web panel
- `apps/mini-app` — React + Vite Telegram Mini App
- `packages/shared` — shared TypeScript types and Zod product validation
- `apps/backend/prisma` — production Prisma schema and migrations

## Prerequisites

- Node.js 20.x
- npm 10.x
- Docker + Docker Compose for containerized local deployment
- PostgreSQL 16 when running backend without Docker

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `BOT_TOKEN`
- `TELEGRAM_WEBAPP_URL`
- `PORT`
- `NODE_ENV`
- `ALLOW_DEV_AUTH_BYPASS`

`ALLOW_DEV_AUTH_BYPASS=true` is for local development only. Keep it `false` elsewhere.

Never commit real secrets.

## Install

```bash
npm ci
```

## Development

```bash
npm run dev
```

Backend runs from `apps/backend/src/server.ts`.

## Prisma

Generate client:

```bash
npm run prisma:generate
```

Create/apply development migration:

```bash
npm run prisma:migrate
```

## Docker

Set production values in `.env`, then:

```bash
docker compose up --build
```

PostgreSQL stays inside Docker network. Backend exposes port `3000`. Web exposes port `80`.

## Tests

```bash
npm test
```

CI also runs Prisma generation, database schema setup, workspace builds, tests, and Docker image builds.

## Security

Telegram Mini App requests must provide valid `x-telegram-init-data`. Production authentication never accepts `x-dev-user-id`.

If credentials were ever committed, revoke/reset them first. Removing them from current files does not remove them from Git history.
