import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { ExportsModule } from './exports/exports.module';
import { FinancialsModule } from './financials/financials.module';
import { OwnersModule } from './owners/owners.module';
import { ScrapingModule } from './scraping/scraping.module';
import { StatisticsModule } from './statistics/statistics.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 60_000 }),
    BullModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ connection: { url: config.get('REDIS_URL', 'redis://localhost:6379') } }) }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    FinancialsModule,
    OwnersModule,
    StatisticsModule,
    ScrapingModule,
    SyncModule,
    AdminModule,
    UsersModule,
    SubscriptionsModule,
    ExportsModule,
    AiModule,
  ],
})
export class AppModule {}
