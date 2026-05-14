import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { PrismaService } from '../common/prisma/prisma.service';
@Injectable()
export class SyncService { constructor(@InjectQueue('sync') private queue: Queue, private prisma: PrismaService) {} async enqueue(source?: string) { const syncJob = await this.prisma.syncJob.create({ data: { source: source ?? 'all', status: 'QUEUED' } }); await this.queue.add('daily-company-sync', { source, syncJobId: syncJob.id }, { attempts: 5, backoff: { type: 'exponential', delay: 30000 }, removeOnComplete: 100 }); return syncJob; } @Cron('0 3 * * *') daily() { return this.enqueue(); } list() { return this.prisma.syncJob.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); } }
