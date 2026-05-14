# API documentation

Swagger is generated at `/docs`. REST resources support pagination, autocomplete search, company details, financial reports, owners, statistics, admin sync jobs, exports and AI assistant queries.

Authentication uses JWT bearer tokens for users and `x-api-key` for API customers. Rate limiting should be enforced at Nginx/API gateway and Nest guards in production.
