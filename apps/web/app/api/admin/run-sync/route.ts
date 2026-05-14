import { NextResponse } from 'next/server';
import { apiBase } from '../../../../lib/api';
export async function POST() { await fetch(`${apiBase}/api/admin/sync-jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }); return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')); }
