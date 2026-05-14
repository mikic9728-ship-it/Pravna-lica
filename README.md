# RS Business Intelligence Portal

Production-oriented SaaS monorepo for company intelligence in the Republic of Srpska, inspired by Bloomberg, Crunchbase, CompanyWall and PitchBook.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn-style components, Framer Motion-ready layout, Recharts.
- Backend: NestJS, PostgreSQL, Prisma ORM, Redis, BullMQ, Swagger.
- Scraping: adapter pattern with Axios/Cheerio and Playwright/Puppeteer dependencies, retry, rate-limit and queue-processing hooks.
- Auth/monetization: JWT, Google OAuth-ready config, API keys, FREE/PRO/ENTERPRISE subscription model.
- Deployment: Docker, Docker Compose, Nginx reverse proxy.

## Legal and compliance note

Before enabling any scraper against APIF RS, business registers, CompanyWall BiH, FIA, court registers or other public sources, operators must verify official API availability, terms of use, robots.txt, copyright/database rights, GDPR and local personal-data rules. The included adapters expose `checkPolicy()` and are intentionally conservative until source-specific permissions are configured.

## Quick start

```bash
cp .env.example .env
npm install
npm run prisma:generate -w @rsbi/api
docker compose up --build
npm run prisma:seed -w @rsbi/api
```

- Web: http://localhost:3000
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/docs

## API endpoints

- `GET /api/companies`
- `GET /api/companies/:id`
- `GET /api/companies/search?q=`
- `GET /api/financials`
- `GET /api/owners`
- `GET /api/statistics`
- `POST /api/admin/sync-jobs`
- `POST /api/ai/ask`

## Architecture

The system is a modular monolith with clean module boundaries: controllers for REST transport, service layer for business logic, Prisma repositories through `PrismaService`, BullMQ workers for background jobs, cron scheduling for daily updates, and data-source adapters for source-specific collection logic.

## Deployment guide

1. Store secrets in Vault/KMS or your cloud secret manager; never commit production `.env`.
2. Configure `DATABASE_URL`, `REDIS_URL`, JWT secret, Google OAuth credentials and OpenAI API key.
3. Review and enable each data-source adapter only after legal approval.
4. Run migrations with `npm run db:migrate`.
5. Deploy with `docker compose up -d --build` or convert service definitions to Kubernetes manifests.
6. Put Nginx behind TLS termination and enable Sentry/Prometheus for production monitoring.

## Testing

```bash
npm run test
npm run build
```
