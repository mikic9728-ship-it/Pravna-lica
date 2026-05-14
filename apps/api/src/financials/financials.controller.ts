import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../common/prisma/prisma.service';

class FinancialReportDto {
  @IsString()
  companyId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1990)
  year!: number;

  @Type(() => Number)
  @IsNumber()
  revenue!: number;

  @Type(() => Number)
  @IsNumber()
  profit!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assets?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  liabilities?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ebitda?: number;

  @IsOptional()
  @IsString()
  source?: string;
}

@ApiTags('financials')
@Controller('financials')
export class FinancialsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('companyId') companyId?: string, @Query('year') year?: string) {
    return this.prisma.financialReport.findMany({
      where: { companyId, year: year ? Number(year) : undefined },
      include: { company: { include: { address: true, industry: true } } },
      orderBy: [{ year: 'desc' }, { company: { name: 'asc' } }],
    });
  }

  @Post()
  create(@Body() dto: FinancialReportDto) {
    return this.prisma.financialReport.create({ data: { ...dto, source: dto.source ?? 'Manual admin entry' } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<FinancialReportDto>) {
    return this.prisma.financialReport.update({ where: { id }, data: dto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.financialReport.delete({ where: { id } });
  }
}
