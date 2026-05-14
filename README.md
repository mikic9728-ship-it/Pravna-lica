# RS Business Intelligence Portal

Modern SaaS application for company intelligence in the Republic of Srpska. The codebase includes a Next.js 15 frontend, NestJS REST API, PostgreSQL/Prisma data layer, Redis/BullMQ background sync architecture, adapter-based data collection, Swagger documentation, Docker Compose deployment, and a 50-company demo dataset.

## Features

- Responsive Crunchbase/Bloomberg-style UI with dark mode, search, filters, ranking cards, charts, company profiles, comparison and admin dashboard.
- Company pages with JIB, registration number, address, status, industry, employees, revenue, profit/loss, salary, EBITDA, profit margin, debt ratio, owners, beneficial owners, contacts, historical financial reports and Recharts visualisations.
- REST API with CRUD for companies, financial reports and owners, plus statistics, exports, AI assistant and admin sync endpoints.
- PostgreSQL full data model with Prisma schema, committed initial migration, indexes and demo seed data for 50 Republic of Srpska companies.
- Scheduler/queue design for automatic daily updates with BullMQ, retry/backoff, adapter policy checks, rate limiting and audit logs.
- Docker deployment with PostgreSQL, Redis, API, Web and Nginx reverse proxy.

## Legal and compliance note

Before enabling automated scraping against APIF RS, court registers, FIA, CompanyWall BiH or any other source, operators must verify official API availability, terms of use, robots.txt, copyright/database rights, GDPR and local personal-data rules. Each source adapter exposes `checkPolicy()` and should stay disabled or conservative until source-specific approval is complete.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose

## Local development

```bash
cp .env.example .env
npm install
npm run prisma:generate -w @rsbi/api
docker compose up postgres redis
npm run db:migrate
npm run db:seed
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/docs
- Admin seed user: `admin@rsbi.local` / `Admin12345!`
- Development API key: `dev-admin-api-key`

## Docker deployment

```bash
cp .env.example .env
docker compose up --build
```

The API container runs Prisma migrations and seed data before starting NestJS. Nginx exposes the combined stack on http://localhost.

## API endpoints

- `GET /api/companies` with `q`, `city`, `industry`, `status`, `page`, `limit`
- `POST /api/companies`
- `GET /api/companies/:id`
- `PATCH /api/companies/:id`
- `DELETE /api/companies/:id`
- `GET /api/companies/search?q=`
- `GET /api/companies/facets`
- `GET /api/companies/top/:metric`
- `GET /api/companies/fastest-growing`
- `GET /api/companies/compare/list?ids=a,b,c`
- `GET|POST|PATCH|DELETE /api/financials`
- `GET|POST|PATCH|DELETE /api/owners`
- `GET /api/statistics`
- `POST /api/admin/sync-jobs`
- `GET /api/admin/api-status`
- `POST /api/ai/ask`
- `GET /api/exports/companies/:id/excel`
- `GET /api/exports/companies/:id/pdf`

## Architecture

The project is a modular monolith:

- `apps/web`: Next.js App Router UI, Tailwind, next-themes and Recharts.
- `apps/api`: NestJS modules grouped by business capability.
- `apps/api/prisma`: Prisma schema, migration and seed script.
- `apps/api/src/scraping`: data-source adapter contracts and scraping engine.
- `apps/api/src/sync`: BullMQ workers and cron scheduling.
- `nginx`: production reverse proxy and security headers.

## Production hardening checklist

1. Replace `.env.example` values with secrets from Vault/KMS/cloud secret manager.
2. Put Nginx or a cloud load balancer behind TLS.
3. Add Sentry/OpenTelemetry/Prometheus exporters.
4. Add per-plan API rate limits and Stripe/Paddle billing webhooks.
5. Enable source adapters only after legal review and source-specific configuration.
6. Run `npm run build`, `npm run test`, Prisma migrations and E2E tests in CI.
