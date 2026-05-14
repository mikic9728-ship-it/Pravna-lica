'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Company } from '../../lib/api';

export function MarketTrendChart({ companies }: { companies: Company[] }) {
  const totals = new Map<number, { year: number; revenue: number; profit: number }>();
  for (const company of companies) {
    for (const report of company.financialReports ?? []) {
      const row = totals.get(report.year) ?? { year: report.year, revenue: 0, profit: 0 };
      row.revenue += Number(report.revenue);
      row.profit += Number(report.profit);
      totals.set(report.year, row);
    }
  }
  const data = [...totals.values()].sort((a, b) => a.year - b.year);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#f5c542" fill="#f5c542" fillOpacity={0.18} />
        <Area type="monotone" dataKey="profit" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.16} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IndustryBarChart({ companies }: { companies: Company[] }) {
  const totals = new Map<string, number>();
  for (const company of companies) {
    const key = company.industry?.name ?? 'Ostalo';
    totals.set(key, (totals.get(key) ?? 0) + Number(company.revenue ?? 0));
  }
  const data = [...totals.entries()]
    .map(([industry, revenue]) => ({ industry, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
        <XAxis type="number" />
        <YAxis dataKey="industry" type="category" width={130} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#f5c542" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
