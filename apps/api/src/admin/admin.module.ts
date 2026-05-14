import { Module } from '@nestjs/common';
import { SyncModule } from '../sync/sync.module';
import { AdminController } from './admin.controller';
@Module({ imports: [SyncModule], controllers: [AdminController] })
export class AdminModule {}
