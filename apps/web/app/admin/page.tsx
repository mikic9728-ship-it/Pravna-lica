import { Card } from '../../components/ui/card';
import { fetchApi } from '../../lib/api';

type SyncJob = { id: string; source: string; status: string; recordsProcessed: number; recordsCreated: number; recordsUpdated: number; errorMessage?: string; createdAt: string };
type User = { id: string; email: string; name?: string; role: string; subscription?: { tier: string; active: boolean } };

export default async function AdminPage() {
  const [jobs, status, users, subs] = await Promise.all([
    fetchApi<SyncJob[]>('/admin/sync-jobs').catch(() => []),
    fetchApi<{ api: string; database?: string; timestamp?: string }>('/admin/api-status').catch(() => ({ api: 'offline' })),
    fetchApi<User[]>('/admin/users').catch(() => []),
    fetchApi<unknown[]>('/admin/subscriptions').catch(() => []),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="font-bold uppercase tracking-widest text-primary">Operations</p>
      <h1 className="text-4xl font-black md:text-5xl">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card><p className="text-slate-500">API status</p><b className="text-2xl">{status.api}</b></Card>
        <Card><p className="text-slate-500">Database</p><b className="text-2xl">{status.database ?? 'unknown'}</b></Card>
        <Card><p className="text-slate-500">Korisnici</p><b className="text-2xl">{users.length}</b></Card>
        <Card><p className="text-slate-500">Subscriptions</p><b className="text-2xl">{subs.length}</b></Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Sync jobovi</h2>
            <form action="/api/admin/run-sync" method="post">
              <button className="rounded-xl bg-primary px-4 py-2 font-bold text-[#07111f]">Ručno pokreni sync</button>
            </form>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead><tr className="text-slate-500"><th>Source</th><th>Status</th><th>Processed</th><th>Created</th><th>Updated</th><th>Error</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <tr className="border-t dark:border-white/10" key={job.id}>
                  <td className="py-3">{job.source}</td>
                  <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-white/10">{job.status}</span></td>
                  <td>{job.recordsProcessed}</td>
                  <td>{job.recordsCreated}</td>
                  <td>{job.recordsUpdated}</td>
                  <td>{job.errorMessage ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Korisnici i paketi</h2>
          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-white/10" key={user.id}>
                <b>{user.email}</b>
                <p className="text-slate-500">{user.role} · {user.subscription?.tier ?? 'FREE'} · {user.subscription?.active ? 'active' : 'inactive'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="font-black">Scraping, compliance i monitoring</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 dark:border-white/10"><b>Policy checks</b><p className="text-sm text-slate-500">Svaki adapter mora vratiti terms/robots/API status prije synca.</p></div>
          <div className="rounded-xl border p-4 dark:border-white/10"><b>Retry queue</b><p className="text-sm text-slate-500">BullMQ koristi exponential backoff i historiju jobova.</p></div>
          <div className="rounded-xl border p-4 dark:border-white/10"><b>Audit log</b><p className="text-sm text-slate-500">CRUD i sync promjene se zapisuju u AuditLog tabelu.</p></div>
        </div>
      </Card>
    </main>
  );
}
