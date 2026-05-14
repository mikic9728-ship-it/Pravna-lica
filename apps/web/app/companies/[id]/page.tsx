import type { Metadata } from 'next';
import Link from 'next/link';
import { RevenueChart, EmployeeChart } from '../../../components/charts/company-charts';
import { Card } from '../../../components/ui/card';
import { Company, browserApiBase, fetchApi, fmt, money } from '../../../lib/api';

type CompanyParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: CompanyParams }): Promise<Metadata> {
  const { id } = await params;
  const company = await fetchApi<Company>(`/companies/${id}`).catch(() => undefined);
  return {
    title: company?.name ?? 'Company profile',
    description: company ? `${company.name}: JIB ${company.jib}, finansije, vlasništvo, zaposleni i poslovna analitika.` : undefined,
    openGraph: { title: company?.name, description: company?.industry?.name },
  };
}

function metricValue(label: string, value: unknown) {
  if (label.includes('margin') || label.includes('Debt')) return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
  if (label.includes('Zaposleni')) return fmt(value as string | number);
  if (typeof value === 'number' || !Number.isNaN(Number(value))) return money(value as string | number);
  return String(value ?? 'N/A');
}

export default async function CompanyPage({ params }: { params: CompanyParams }) {
  const { id } = await params;
  const company = await fetchApi<Company>(`/companies/${id}`);
  const latestReport = company.financialReports?.at(-1);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    taxID: company.jib,
    address: company.address ? `${company.address.street}, ${company.address.city}` : undefined,
    url: company.website,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Company profile</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">{company.name}</h1>
          <p className="mt-3 text-slate-500">
            JIB {company.jib} · MB {company.registrationNumber ?? 'N/A'} · {company.address?.street}, {company.address?.city} · {company.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-xl bg-[#07111f] px-4 py-3 text-white" href={`${browserApiBase}/api/exports/companies/${company.slug}/pdf`}>PDF export</a>
          <a className="rounded-xl border px-4 py-3 dark:border-white/10" href={`${browserApiBase}/api/exports/companies/${company.slug}/excel`}>Excel export</a>
          <button className="rounded-xl border px-4 py-3 dark:border-white/10">Share link</button>
          <button className="rounded-xl bg-primary px-4 py-3 font-bold text-[#07111f]">Watchlist</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['Prihodi', company.revenue],
          ['Dobit/gubitak', company.profit],
          ['Zaposleni', company.employeeCount],
          ['Prosječna plata', company.averageSalary],
          ['EBITDA', company.ebitda],
          ['Profit margin', company.profitMargin],
          ['Debt ratio', company.debtRatio],
          ['Djelatnost', company.industry?.name],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <p className="text-sm text-slate-500">{label}</p>
            <b className="mt-1 block text-2xl">{metricValue(String(label), value)}</b>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <Card>
          <h2 className="mb-4 text-xl font-black">Graf prihoda i dobiti</h2>
          <RevenueChart data={company.financialReports ?? []} />
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">Broj zaposlenih</h2>
          <EmployeeChart data={company.employeeStats ?? []} />
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="font-black">Vlasnička struktura</h2>
          <div className="mt-4 space-y-3">
            {company.owners?.map((owner) => (
              <div key={owner.name}>
                <div className="flex justify-between text-sm"><span>{owner.name}</span><b>{owner.ownershipPercent ?? 'N/A'}%</b></div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-2 rounded-full bg-primary" style={{ width: `${Number(owner.ownershipPercent ?? 0)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-black">Stvarni vlasnici</h2>
          <div className="mt-4 space-y-3">
            {company.beneficialOwners?.map((owner) => (
              <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-white/10" key={owner.name}>{owner.name} · {owner.controlType} · {owner.ownershipPercent ?? 'N/A'}%</p>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-black">Kontakt podaci</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Email: {company.email ?? 'N/A'}</p>
            <p>Telefon: {company.phone ?? 'N/A'}</p>
            <p>Web: {company.website ? <a className="text-primary" href={company.website}>{company.website}</a> : 'N/A'}</p>
            <p>Osnovano: {company.foundedAt ? new Date(company.foundedAt).getFullYear() : 'N/A'}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.7fr]">
        <Card className="overflow-x-auto">
          <h2 className="mb-4 font-black">Istorija finansijskih izvještaja</h2>
          <table className="w-full text-left text-sm">
            <thead><tr className="text-slate-500"><th>Godina</th><th>Prihod</th><th>Dobit</th><th>EBITDA</th><th>Imovina</th><th>Obaveze</th></tr></thead>
            <tbody>
              {company.financialReports?.map((report) => (
                <tr className="border-t dark:border-white/10" key={report.year}>
                  <td className="py-3 font-bold">{report.year}</td>
                  <td>{money(report.revenue)}</td>
                  <td>{money(report.profit)}</td>
                  <td>{money(report.ebitda)}</td>
                  <td>{money(report.assets)}</td>
                  <td>{money(report.liabilities)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="font-black">Analitički sažetak</h2>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Posljednji dostupni izvještaj je za {latestReport?.year ?? 'N/A'}. Kompanija posluje u sektoru {company.industry?.name ?? 'N/A'} i zapošljava {fmt(company.employeeCount)} radnika.
          </p>
          <Link className="mt-6 inline-flex rounded-xl bg-primary px-4 py-3 font-bold text-[#07111f]" href={`/compare?ids=${company.slug}`}>
            Dodaj u poređenje
          </Link>
        </Card>
      </div>
    </main>
  );
}
