import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
@ApiTags('financials')
@Controller('financials')
export class FinancialsController { constructor(private prisma: PrismaService) {} @Get() list(@Query('companyId') companyId?: string) { return this.prisma.financialReport.findMany({ where: { companyId }, include: { company: true }, orderBy: [{ year: 'desc' }] }); } }
