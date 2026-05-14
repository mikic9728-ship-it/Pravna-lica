import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CompanyQueryDto } from './dto';
@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: CompanyQueryDto) {
    const where: Prisma.CompanyWhereInput = {
      AND: [
        query.q ? { OR: [{ name: { contains: query.q, mode: 'insensitive' } }, { jib: { contains: query.q } }, { registrationNumber: { contains: query.q } }] } : {},
        query.city ? { address: { city: { equals: query.city, mode: 'insensitive' } } } : {},
        query.industry ? { industry: { name: { contains: query.industry, mode: 'insensitive' } } } : {},
      ],
    };
    const [items, total] = await Promise.all([
      this.prisma.company.findMany({ where, include: { address: true, industry: true }, orderBy: { revenue: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      this.prisma.company.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }
  async search(q: string) {
    if (!q?.trim()) return [];
    return this.prisma.company.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { jib: { contains: q } }] }, include: { address: true, industry: true }, take: 10 });
  }
  async findOne(idOrSlug: string) {
    const company = await this.prisma.company.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { jib: idOrSlug }] }, include: { address: true, industry: true, financialReports: { orderBy: { year: 'asc' } }, owners: true, beneficialOwners: true, employeeStats: { orderBy: { year: 'asc' } }, salaryStats: { orderBy: { year: 'asc' } }, relatedCompanies: { include: { related: true } } } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }
  async top(metric: 'revenue' | 'profit' | 'employeeCount', limit = 10) { return this.prisma.company.findMany({ include: { address: true, industry: true }, orderBy: { [metric]: 'desc' }, take: limit }); }
  async compare(ids: string[]) { return this.prisma.company.findMany({ where: { id: { in: ids } }, include: { financialReports: { orderBy: { year: 'asc' } }, address: true, industry: true } }); }
}
