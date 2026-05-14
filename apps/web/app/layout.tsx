import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/layout/header';
import { ThemeProvider } from '../components/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://rsbi.example.com'),
  title: { default: 'RS Business Intelligence Portal', template: '%s | RSBI' },
  description: 'Premium SaaS portal for company search, financial reports, ownership and analytics for companies registered in Republic of Srpska.',
  openGraph: { title: 'RS Business Intelligence Portal', type: 'website', locale: 'bs_BA' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
