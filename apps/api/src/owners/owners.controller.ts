import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
@ApiTags('owners')
@Controller('owners')
export class OwnersController { constructor(private prisma: PrismaService) {} @Get() list(@Query('companyId') companyId?: string) { return this.prisma.owner.findMany({ where: { companyId }, include: { company: true } }); } }
