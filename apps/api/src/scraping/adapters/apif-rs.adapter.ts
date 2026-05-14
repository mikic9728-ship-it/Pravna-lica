import axios from 'axios';
import * as cheerio from 'cheerio';
import { DataSourceAdapter, SourcePolicy } from './data-source.adapter';
export class ApifRsAdapter implements DataSourceAdapter {
  readonly name = 'APIF Republike Srpske';
  async checkPolicy(): Promise<SourcePolicy> { return { officialApi: process.env.APIF_RS_API_URL, termsUrl: 'https://www.apif.net/', robotsTxtUrl: 'https://www.apif.net/robots.txt', legalNotes: ['Verify license, consent basis, data minimization, GDPR/local personal data restrictions before enabling collection.'], rateLimitPerMinute: 20 }; }
  async fetchCompanies() { const html = await axios.get(process.env.APIF_RS_PUBLIC_COMPANIES_URL ?? 'https://www.apif.net/', { timeout: 15000 }).then(r => r.data); const $ = cheerio.load(html); const items = $('table tr').slice(1, 25).map((_, row) => { const cells = $(row).find('td').map((__, c) => $(c).text().trim()).get(); return { name: cells[0] ?? 'Unknown', jib: cells[1] ?? `pending-${Date.now()}`, city: cells[2], status: 'UNKNOWN' as const }; }).get(); return { items }; }
}
