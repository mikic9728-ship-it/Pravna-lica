import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async overview() {
    const [companies, active, totals, byIndustry, reports] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.aggregate({ _sum: { revenue: true, profit: true, employeeCount: true } }),
      this.prisma.industry.findMany({ include: { _count: { select: { companies: true } } }, orderBy: { name: 'asc' } }),
      this.prisma.financialReport.groupBy({ by: ['year'], _sum: { revenue: true, profit: true }, orderBy: { year: 'asc' } }),
    ]);

    return {
      companies,
      active,
      totalRevenue: totals._sum.revenue,
      totalProfit: totals._sum.profit,
      employees: totals._sum.employeeCount,
      byIndustry,
      trends: reports,
    };
  }
}
