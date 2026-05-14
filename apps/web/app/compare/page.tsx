import { Card } from '../../components/ui/card';
import { Company, fetchApi, money, fmt } from '../../lib/api';

type CompareSearchParams = Promise<{ ids?: string }>;

export default async function ComparePage({ searchParams }: { searchParams: CompareSearchParams }) {
  const params = await searchParams;
  const companies = params.ids
    ? await fetchApi<Company[]>(`/companies/compare/list?ids=${encodeURIComponent(params.ids)}`).catch(() => [])
    : [];

  const rows: Array<[string, (company: Company) => string]> = [
    ['Grad', (company) => company.address?.city ?? 'N/A'],
    ['Djelatnost', (company) => company.industry?.name ?? 'N/A'],
    ['Prihod', (company) => money(company.revenue)],
    ['Dobit', (company) => money(company.profit)],
    ['EBITDA', (company) => money(company.ebitda)],
    ['Zaposleni', (company) => fmt(company.employeeCount)],
    ['Profit margin', (company) => `${(Number(company.profitMargin ?? 0) * 100).toFixed(1)}%`],
    ['Debt ratio', (company) => `${(Number(company.debtRatio ?? 0) * 100).toFixed(1)}%`],
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="font-bold uppercase tracking-widest text-primary">PRO analytics</p>
      <h1 className="text-4xl font-black md:text-5xl">Compare companies</h1>
      <Card className="mt-8">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/compare">
          <input
            className="rounded-xl border p-4 dark:border-white/10 dark:bg-transparent"
            name="ids"
            defaultValue={params.ids}
            placeholder="Unesite slugove, ID-jeve ili JIB-ove odvojene zarezom"
          />
          <button className="rounded-xl bg-primary px-6 py-4 font-black text-[#07111f]">Uporedi</button>
        </form>
      </Card>

      {companies.length > 0 && (
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-3">Metric</th>
                {companies.map((company) => <th key={company.id}>{company.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, getter]) => (
                <tr className="border-t dark:border-white/10" key={label}>
                  <td className="py-3 font-bold">{label}</td>
                  {companies.map((company) => <td key={company.id}>{getter(company)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {companies.length === 0 && (
        <Card className="mt-8">
          <h2 className="text-xl font-black">Kako koristiti poređenje?</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Otvorite stranicu kompanije i kliknite „Dodaj u poređenje” ili unesite više slugova/JIB-ova ručno. Sistem će prikazati prihod, dobit, EBITDA, broj zaposlenih i ključne finansijske pokazatelje.</p>
        </Card>
      )}
    </main>
  );
}
