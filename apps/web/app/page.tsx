import Link from 'next/link';
import { IndustryBarChart, MarketTrendChart } from '../components/charts/market-charts';
import { Card } from '../components/ui/card';
import { Company, Facets, Paginated, fetchApi, fmt, money } from '../lib/api';

type HomeSearchParams = Promise<{ q?: string; city?: string; industry?: string }>;

async function getData(searchParams: { q?: string; city?: string; industry?: string }) {
  const qs = new URLSearchParams();
  if (searchParams.q) qs.set('q', searchParams.q);
  if (searchParams.city) qs.set('city', searchParams.city);
  if (searchParams.industry) qs.set('industry', searchParams.industry);
  qs.set('limit', '12');

  const [companies, revenue, profit, employees, growing, stats, facets] = await Promise.all([
    fetchApi<Paginated<Company>>(`/companies?${qs}`).catch(() => ({ items: [], total: 0, page: 1, limit: 12, pages: 0 })),
    fetchApi<Company[]>('/companies/top/revenue?limit=6').catch(() => []),
    fetchApi<Company[]>('/companies/top/profit?limit=6').catch(() => []),
    fetchApi<Company[]>('/companies/top/employeeCount?limit=6').catch(() => []),
    fetchApi<Company[]>('/companies/fastest-growing?limit=10').catch(() => []),
    fetchApi<Record<string, unknown>>('/statistics').catch(() => ({})),
    fetchApi<Facets>('/companies/facets').catch(() => ({ cities: [], industries: [] })),
  ]);

  return { companies, revenue, profit, employees, growing, stats, facets };
}

function RankingList({ title, items, metric }: { title: string; items: Company[]; metric: keyof Company }) {
  return (
    <Card className="h-full">
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="space-y-2">
        {items.map((company, index) => (
          <Link
            href={`/companies/${company.slug}`}
            key={company.id}
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <span className="min-w-0">
              <span className="mr-2 font-black text-primary">#{index + 1}</span>
              <span className="font-semibold">{company.name}</span>
              <p className="truncate text-xs text-slate-500">{company.address?.city} · {company.industry?.name}</p>
            </span>
            <b className="ml-3 whitespace-nowrap text-sm">{metric === 'employeeCount' ? fmt(company[metric] as string) : money(company[metric] as string)}</b>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default async function Home({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const { companies, revenue, profit, employees, growing, stats, facets } = await getData(params);
  const chartCompanies = growing.length ? growing : companies.items;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'RS Business Intelligence Portal', applicationCategory: 'BusinessApplication' };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="terminal-grid bg-[#07111f] px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[.3em] text-primary">Republic of Srpska Company Intelligence</p>
          <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">Bloomberg-style poslovna analitika za firme u Republici Srpskoj.</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-300">Pretražite 50 demo kompanija, finansijske izvještaje, vlasništvo, djelatnosti, trendove, poređenja i administraciju sync procesa u modernom SaaS portalu.</p>
          <form className="mt-10 grid max-w-5xl gap-3 rounded-3xl bg-white p-3 shadow-glow md:grid-cols-[1fr_180px_220px_auto]" action="/">
            <input name="q" defaultValue={params.q} placeholder="Naziv, JIB, grad ili djelatnost..." className="rounded-2xl px-4 py-4 text-[#07111f] outline-none ring-1 ring-slate-200" />
            <select name="city" defaultValue={params.city ?? ''} className="rounded-2xl px-4 py-4 text-[#07111f] outline-none ring-1 ring-slate-200">
              <option value="">Svi gradovi</option>
              {facets.cities.map((city) => <option key={city.city} value={city.city}>{city.city}</option>)}
            </select>
            <select name="industry" defaultValue={params.industry ?? ''} className="rounded-2xl px-4 py-4 text-[#07111f] outline-none ring-1 ring-slate-200">
              <option value="">Sve djelatnosti</option>
              {facets.industries.map((industry) => <option key={industry.id} value={industry.name}>{industry.name}</option>)}
            </select>
            <button className="rounded-2xl bg-primary px-8 py-4 font-black text-[#07111f]">Search</button>
          </form>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ['Kompanije', stats.companies],
              ['Aktivne', stats.active],
              ['Ukupan prihod', money(stats.totalRevenue as string)],
              ['Zaposleni', fmt(stats.employees as string)],
            ].map(([label, value]) => (
              <div className="glass rounded-2xl p-5" key={String(label)}>
                <p className="text-sm text-slate-300">{label}</p>
                <b className="text-3xl">{String(value ?? 0)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12" id="companies">
        <div className="grid gap-6 lg:grid-cols-3">
          <RankingList title="Top kompanije po prihodu" items={revenue} metric="revenue" />
          <RankingList title="Top kompanije po dobiti" items={profit} metric="profit" />
          <RankingList title="Top po broju zaposlenih" items={employees} metric="employeeCount" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-black">Ekonomski trendovi: prihod i dobit</h2>
            <MarketTrendChart companies={chartCompanies} />
          </Card>
          <Card>
            <h2 className="mb-4 text-xl font-black">Prihod po djelatnostima</h2>
            <IndustryBarChart companies={[...revenue, ...growing]} />
          </Card>
        </div>

        <div className="mt-14 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Search results</p>
            <h2 className="text-3xl font-black">{companies.total} kompanija pronađeno</h2>
          </div>
          <Link className="rounded-xl border px-4 py-2 text-sm font-bold dark:border-white/10" href="/compare">Uporedi kompanije</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.items.map((company) => (
            <Link href={`/companies/${company.slug}`} key={company.id}>
              <Card className="h-full transition hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">{company.industry?.name}</p>
                    <h3 className="mt-2 text-lg font-black">{company.name}</h3>
                    <p className="text-sm text-slate-500">{company.address?.city} · JIB {company.jib}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">{company.status}</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-slate-500">Prihod</p><b>{money(company.revenue)}</b></div>
                  <div><p className="text-slate-500">Dobit</p><b>{money(company.profit)}</b></div>
                  <div><p className="text-slate-500">Zaposleni</p><b>{fmt(company.employeeCount)}</b></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
