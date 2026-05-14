export const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const browserApiBase = process.env.NEXT_PUBLIC_BROWSER_API_URL ?? 'http://localhost:4000';

export type FinancialReport = { year: number; revenue: string | number; profit: string | number; assets?: string | number; liabilities?: string | number; ebitda?: string | number };
export type Company = {
  id: string;
  name: string;
  slug: string;
  jib: string;
  registrationNumber?: string;
  logoUrl?: string;
  foundedAt?: string;
  status: string;
  website?: string;
  email?: string;
  phone?: string;
  employeeCount?: number;
  revenue?: string | number;
  profit?: string | number;
  averageSalary?: string | number;
  ebitda?: string | number;
  profitMargin?: string | number;
  debtRatio?: string | number;
  growth?: number;
  address?: { city: string; street: string; municipality?: string; postalCode?: string };
  industry?: { name: string; naceCode?: string };
  financialReports?: FinancialReport[];
  owners?: Array<{ name: string; ownershipPercent?: string | number; country?: string }>;
  beneficialOwners?: Array<{ name: string; controlType?: string; ownershipPercent?: string | number }>;
  relatedCompanies?: Array<{ relationType: string; related: Company }>;
  employeeStats?: Array<{ year: number; count: number }>;
  salaryStats?: Array<{ year: number; averageGross: string | number; averageNet?: string | number }>;
};

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number; pages: number };
export type Facets = { cities: Array<{ city: string; _count: { city: number } }>; industries: Array<{ id: string; name: string; _count: { companies: number } }> };

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}/api${path}`, { next: { revalidate: 120 }, ...init });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json();
}

export const fmt = (v?: string | number) =>
  new Intl.NumberFormat('bs-BA', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v ?? 0));

export const money = (v?: string | number) =>
  new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM', notation: 'compact', maximumFractionDigits: 1 }).format(Number(v ?? 0));
