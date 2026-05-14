import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScrapingModule } from '../scraping/scraping.module';
import { SyncProcessor } from './sync.processor';
import { SyncService } from './sync.service';
@Module({ imports: [BullModule.registerQueue({ name: 'sync' }), ScrapingModule], providers: [SyncService, SyncProcessor], exports: [SyncService] })
export class SyncModule {}
