import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { SyncService } from '../sync/sync.service';
@ApiTags('admin')
@Controller('admin')
export class AdminController { constructor(private sync: SyncService, private prisma: PrismaService) {} @Get('sync-jobs') jobs() { return this.sync.list(); } @Post('sync-jobs') run(@Body('source') source?: string) { return this.sync.enqueue(source); } @Get('scraping-logs') logs() { return this.prisma.auditLog.findMany({ where: { entity: 'Scraping' }, orderBy: { createdAt: 'desc' }, take: 100 }); } @Get('api-status') async status() { await this.prisma.$queryRaw`SELECT 1`; return { api: 'ok', database: 'ok', timestamp: new Date().toISOString() }; } @Get('users') users() { return this.prisma.user.findMany({ include: { subscription: true }, orderBy: { createdAt: 'desc' } }); } @Get('subscriptions') subscriptions() { return this.prisma.subscription.findMany({ include: { user: true } }); } }
