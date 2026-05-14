import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CompanyQueryDto, CreateCompanyDto, UpdateCompanyDto } from './dto';

const companyInclude = {
  address: true,
  industry: true,
  financialReports: { orderBy: { year: 'asc' as const } },
  owners: true,
  beneficialOwners: true,
  employeeStats: { orderBy: { year: 'asc' as const } },
  salaryStats: { orderBy: { year: 'asc' as const } },
  relatedCompanies: { include: { related: true } },
};

function slugify(name: string, jib: string) {
  return `${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')}-${jib.slice(-4)}`;
}

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CompanyQueryDto) {
    const where = this.buildWhere(query);
    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: { address: true, industry: true },
        orderBy: [{ revenue: 'desc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async search(q: string) {
    const term = q?.trim();
    if (!term) return [];

    return this.prisma.company.findMany({
      where: this.buildWhere({ q: term, page: 1, limit: 10 }),
      include: { address: true, industry: true },
      orderBy: [{ revenue: 'desc' }, { name: 'asc' }],
      take: 10,
    });
  }

  async findOne(idOrSlug: string) {
    const company = await this.prisma.company.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { jib: idOrSlug }] },
      include: companyInclude,
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    const industry = await this.resolveIndustry(dto);
    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        slug: slugify(dto.name, dto.jib),
        jib: dto.jib,
        registrationNumber: dto.registrationNumber,
        foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : undefined,
        status: dto.status ?? 'ACTIVE',
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        employeeCount: dto.employeeCount,
        revenue: dto.revenue,
        profit: dto.profit,
        averageSalary: dto.averageSalary,
        ebitda: dto.profit ? dto.profit * 1.2 : undefined,
        profitMargin: dto.revenue && dto.profit ? dto.profit / dto.revenue : undefined,
        debtRatio: 0.3,
        industryId: industry?.id,
        address: dto.city
          ? { create: { city: dto.city, street: dto.street ?? 'Nije dostupno' } }
          : undefined,
      },
      include: companyInclude,
    });

    await this.audit('CREATE', company.id, { dto });
    return company;
  }

  async update(idOrSlug: string, dto: UpdateCompanyDto) {
    const existing = await this.findOne(idOrSlug);
    const industry = await this.resolveIndustry(dto);
    const company = await this.prisma.company.update({
      where: { id: existing.id },
      data: {
        name: dto.name,
        slug: dto.name ? slugify(dto.name, dto.jib ?? existing.jib) : undefined,
        jib: dto.jib,
        registrationNumber: dto.registrationNumber,
        foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : undefined,
        status: dto.status,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        employeeCount: dto.employeeCount,
        revenue: dto.revenue,
        profit: dto.profit,
        averageSalary: dto.averageSalary,
        ebitda: dto.profit ? dto.profit * 1.2 : undefined,
        profitMargin: dto.revenue && dto.profit ? dto.profit / dto.revenue : undefined,
        industryId: industry?.id,
        address: dto.city
          ? { upsert: { create: { city: dto.city, street: dto.street ?? 'Nije dostupno' }, update: { city: dto.city, street: dto.street ?? 'Nije dostupno' } } }
          : undefined,
      },
      include: companyInclude,
    });

    await this.audit('UPDATE', company.id, { dto });
    return company;
  }

  async remove(idOrSlug: string) {
    const existing = await this.findOne(idOrSlug);
    await this.audit('DELETE', existing.id, { name: existing.name });
    return this.prisma.company.delete({ where: { id: existing.id } });
  }

  async top(metric: 'revenue' | 'profit' | 'employeeCount', limit = 10) {
    return this.prisma.company.findMany({
      include: { address: true, industry: true },
      orderBy: { [metric]: 'desc' },
      take: limit,
    });
  }

  async fastestGrowing(limit = 10) {
    const companies = await this.prisma.company.findMany({
      include: { address: true, industry: true, financialReports: { orderBy: { year: 'asc' } } },
      take: 100,
    });

    return companies
      .map((company) => {
        const first = company.financialReports.at(0);
        const last = company.financialReports.at(-1);
        const growth = first && last && Number(first.revenue) > 0
          ? (Number(last.revenue) - Number(first.revenue)) / Number(first.revenue)
          : 0;
        return { ...company, growth };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, limit);
  }

  async compare(ids: string[]) {
    return this.prisma.company.findMany({
      where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }, { jib: { in: ids } }] },
      include: companyInclude,
      orderBy: { revenue: 'desc' },
    });
  }

  async facets() {
    const [cities, industries] = await Promise.all([
      this.prisma.address.groupBy({ by: ['city'], _count: { city: true }, orderBy: { _count: { city: 'desc' } }, take: 20 }),
      this.prisma.industry.findMany({ include: { _count: { select: { companies: true } } }, orderBy: { name: 'asc' } }),
    ]);
    return { cities, industries };
  }

  private buildWhere(query: Pick<CompanyQueryDto, 'q' | 'city' | 'industry' | 'status'>): Prisma.CompanyWhereInput {
    const term = query.q?.trim();
    return {
      AND: [
        term
          ? {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { jib: { contains: term } },
                { registrationNumber: { contains: term } },
                { address: { city: { contains: term, mode: 'insensitive' } } },
                { industry: { name: { contains: term, mode: 'insensitive' } } },
              ],
            }
          : {},
        query.city ? { address: { city: { equals: query.city, mode: 'insensitive' } } } : {},
        query.industry ? { industry: { name: { contains: query.industry, mode: 'insensitive' } } } : {},
        query.status ? { status: query.status } : {},
      ],
    };
  }

  private async resolveIndustry(dto: Pick<CreateCompanyDto, 'industryName' | 'naceCode'>) {
    if (!dto.industryName) return undefined;
    return this.prisma.industry.upsert({
      where: { naceCode: dto.naceCode ?? dto.industryName.slice(0, 4).toUpperCase() },
      update: { name: dto.industryName },
      create: { naceCode: dto.naceCode ?? dto.industryName.slice(0, 4).toUpperCase(), name: dto.industryName },
    });
  }

  private audit(action: string, entityId: string, diff: unknown) {
    const jsonDiff = JSON.parse(JSON.stringify(diff)) as Prisma.InputJsonValue;
    return this.prisma.auditLog.create({ data: { action, entity: 'Company', entityId, diff: jsonDiff } });
  }
}
