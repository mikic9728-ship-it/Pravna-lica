import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/layout/header';
export const metadata: Metadata = { title: { default: 'RS Business Intelligence Portal', template: '%s | RSBI' }, description: 'Premium SaaS portal for business data, financial reports, ownership, and analytics for companies registered in Republic of Srpska.', openGraph: { title: 'RS Business Intelligence Portal', type: 'website' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="bs"><body><Header />{children}</body></html>; }
