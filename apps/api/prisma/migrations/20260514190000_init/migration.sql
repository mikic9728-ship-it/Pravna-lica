-- Initial schema for RS Business Intelligence Portal.
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANKRUPTCY', 'LIQUIDATION', 'UNKNOWN');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SyncStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'PARTIAL');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

CREATE TABLE "Industry" (
  "id" TEXT PRIMARY KEY,
  "naceCode" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "sector" TEXT
);

CREATE TABLE "Company" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "jib" TEXT NOT NULL UNIQUE,
  "registrationNumber" TEXT UNIQUE,
  "logoUrl" TEXT,
  "foundedAt" TIMESTAMP(3),
  "status" "CompanyStatus" NOT NULL DEFAULT 'UNKNOWN',
  "website" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "employeeCount" INTEGER,
  "revenue" DECIMAL(18,2),
  "profit" DECIMAL(18,2),
  "averageSalary" DECIMAL(18,2),
  "ebitda" DECIMAL(18,2),
  "profitMargin" DECIMAL(8,4),
  "debtRatio" DECIMAL(8,4),
  "searchVector" tsvector,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "industryId" TEXT REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Address" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL UNIQUE REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "street" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "municipality" TEXT,
  "postalCode" TEXT,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7)
);

CREATE TABLE "FinancialReport" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "year" INTEGER NOT NULL,
  "revenue" DECIMAL(18,2) NOT NULL,
  "profit" DECIMAL(18,2) NOT NULL,
  "assets" DECIMAL(18,2),
  "liabilities" DECIMAL(18,2),
  "equity" DECIMAL(18,2),
  "ebitda" DECIMAL(18,2),
  "source" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "reportedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("companyId", "year")
);

CREATE TABLE "Owner" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "ownershipPercent" DECIMAL(6,3),
  "country" TEXT,
  "validFrom" TIMESTAMP(3),
  "validTo" TIMESTAMP(3)
);

CREATE TABLE "BeneficialOwner" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "controlType" TEXT,
  "ownershipPercent" DECIMAL(6,3),
  "riskFlag" TEXT
);

CREATE TABLE "RelatedCompany" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "relatedCompanyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "relationType" TEXT NOT NULL,
  UNIQUE ("companyId", "relatedCompanyId", "relationType")
);

CREATE TABLE "EmployeeStats" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "year" INTEGER NOT NULL,
  "count" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  UNIQUE ("companyId", "year")
);

CREATE TABLE "SalaryStats" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "year" INTEGER NOT NULL,
  "averageGross" DECIMAL(18,2) NOT NULL,
  "averageNet" DECIMAL(18,2),
  "source" TEXT NOT NULL,
  UNIQUE ("companyId", "year")
);

CREATE TABLE "SyncJob" (
  "id" TEXT PRIMARY KEY,
  "source" TEXT NOT NULL,
  "status" "SyncStatus" NOT NULL DEFAULT 'QUEUED',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
  "recordsCreated" INTEGER NOT NULL DEFAULT 0,
  "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "diff" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "passwordHash" TEXT,
  "googleId" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "apiKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "_Watchlist" (
  "A" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "B" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("A", "B")
);

CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Company_jib_idx" ON "Company"("jib");
CREATE INDEX "Company_industryId_idx" ON "Company"("industryId");
CREATE INDEX "Company_status_idx" ON "Company"("status");
CREATE INDEX "FinancialReport_year_idx" ON "FinancialReport"("year");
CREATE INDEX "Company_search_idx" ON "Company" USING GIN ("searchVector");
CREATE INDEX "Address_city_idx" ON "Address"("city");
CREATE INDEX "_Watchlist_B_idx" ON "_Watchlist"("B");

CREATE OR REPLACE FUNCTION company_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('simple', coalesce(NEW."name", '') || ' ' || coalesce(NEW."jib", '') || ' ' || coalesce(NEW."registrationNumber", ''));
  NEW."updatedAt" := CURRENT_TIMESTAMP;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Company"
FOR EACH ROW EXECUTE FUNCTION company_search_vector_update();
