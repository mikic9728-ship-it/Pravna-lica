import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController { constructor(private prisma: PrismaService) {} @Get() async overview() { const [companies, active, revenue] = await Promise.all([this.prisma.company.count(), this.prisma.company.count({ where: { status: 'ACTIVE' } }), this.prisma.company.aggregate({ _sum: { revenue: true, profit: true, employeeCount: true } })]); return { companies, active, totalRevenue: revenue._sum.revenue, totalProfit: revenue._sum.profit, employees: revenue._sum.employeeCount }; } }
