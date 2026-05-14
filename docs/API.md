# RSBI API

Swagger UI is served at `/docs` by the NestJS API. All endpoints are prefixed with `/api` except Swagger.

## Authentication

User authentication uses JWT bearer tokens from `/api/auth/login`. API customers can use `x-api-key`; seed data creates `dev-admin-api-key` for local development.

## Search examples

```bash
curl "http://localhost:4000/api/companies?q=Banja%20Luka&limit=10"
curl "http://localhost:4000/api/companies/search?q=Lanaco"
curl "http://localhost:4000/api/companies/top/revenue?limit=5"
curl "http://localhost:4000/api/companies/compare/list?ids=lanaco-0007,mtel-banja-luka-0002"
```

## CRUD example

```bash
curl -X POST http://localhost:4000/api/companies \
  -H 'content-type: application/json' \
  -d '{"name":"Demo d.o.o.","jib":"4409999990001","city":"Banja Luka","industryName":"IT","revenue":1000000,"profit":120000,"employeeCount":25}'
```

## Admin sync

```bash
curl -X POST http://localhost:4000/api/admin/sync-jobs -H 'content-type: application/json' -d '{}'
curl http://localhost:4000/api/admin/sync-jobs
```

## AI assistant

```bash
curl -X POST http://localhost:4000/api/ai/ask \
  -H 'content-type: application/json' \
  -d '{"question":"Koje IT firme iz Banjaluke imaju najveći prihod?"}'
```
