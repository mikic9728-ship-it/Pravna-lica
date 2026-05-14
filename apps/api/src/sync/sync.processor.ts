import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../common/prisma/prisma.service';
import { ApifRsAdapter } from '../scraping/adapters/apif-rs.adapter';
import { PublicRegistryAdapter } from '../scraping/adapters/public-registry.adapter';
import { ScrapingEngine } from '../scraping/engine/scraping.engine';

@Processor('sync')
export class SyncProcessor extends WorkerHost {
  constructor(private prisma: PrismaService, private engine: ScrapingEngine) {
    super();
  }

  async process(job: Job<{ source?: string; syncJobId: string }>) {
    await this.prisma.syncJob.update({
      where: { id: job.data.syncJobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    const adapters = [new ApifRsAdapter(), new PublicRegistryAdapter()].filter(
      (adapter) => !job.data.source || adapter.name === job.data.source,
    );
    let processed = 0;
    let created = 0;
    let updated = 0;

    try {
      for (const adapter of adapters) {
        const companies = await this.engine.run(adapter);
        for (const item of companies) {
          const existing = await this.prisma.company.findUnique({ where: { jib: item.jib } });
          await this.prisma.company.upsert({
            where: { jib: item.jib },
            update: {
              name: item.name,
              registrationNumber: item.registrationNumber,
              status: item.status ?? 'UNKNOWN',
              website: item.website,
              address: item.city
                ? { upsert: { create: { city: item.city, street: item.address ?? 'N/A' }, update: { city: item.city, street: item.address ?? 'N/A' } } }
                : undefined,
            },
            create: {
              name: item.name,
              slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.jib.slice(-4)}`,
              jib: item.jib,
              registrationNumber: item.registrationNumber,
              status: item.status ?? 'UNKNOWN',
              website: item.website,
              address: item.city ? { create: { city: item.city, street: item.address ?? 'N/A' } } : undefined,
            },
          });
          processed += 1;
          if (existing) updated += 1;
          else created += 1;
        }
      }

      await this.prisma.syncJob.update({
        where: { id: job.data.syncJobId },
        data: { status: 'SUCCEEDED', finishedAt: new Date(), recordsProcessed: processed, recordsCreated: created, recordsUpdated: updated },
      });
    } catch (error) {
      await this.prisma.syncJob.update({
        where: { id: job.data.syncJobId },
        data: { status: 'FAILED', finishedAt: new Date(), errorMessage: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
