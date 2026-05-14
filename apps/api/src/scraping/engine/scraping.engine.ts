import { Injectable, Logger } from '@nestjs/common';
import { setTimeout as sleep } from 'timers/promises';
import { DataSourceAdapter } from '../adapters/data-source.adapter';

const userAgents = [
  'Mozilla/5.0 RSBI Research Bot (+compliance contact)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
];

@Injectable()
export class ScrapingEngine {
  private readonly logger = new Logger(ScrapingEngine.name);

  async run(adapter: DataSourceAdapter) {
    const policy = await adapter.checkPolicy();
    this.logger.log(`Policy checked for ${adapter.name}: ${JSON.stringify(policy)}`);
    const delay = Math.ceil(60_000 / Math.max(policy.rateLimitPerMinute, 1));
    let cursor: string | undefined;
    const all = [];

    do {
      const page = await this.withRetry(() => adapter.fetchCompanies(cursor));
      all.push(...page.items);
      cursor = page.nextCursor;
      await sleep(delay);
    } while (cursor);

    return all;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let last: unknown;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        last = error;
        await sleep(500 * 2 ** attempt);
      }
    }
    throw last;
  }

  randomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
}
