import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-white">
        <Link href="/" className="font-black tracking-tight">
          <span className="text-primary">RS</span> Business Intelligence
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link className="hover:text-white" href="/#companies">Kompanije</Link>
          <Link className="hover:text-white" href="/compare">Compare</Link>
          <Link className="hover:text-white" href="/admin">Admin</Link>
          <a className="hover:text-white" href="http://localhost:4000/docs">API Docs</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/compare" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-[#07111f]">
            Pro Trial
          </Link>
        </div>
      </div>
    </header>
  );
}
