import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../common/prisma/prisma.service';

class OwnerDto {
  @IsString()
  companyId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownershipPercent?: number;

  @IsOptional()
  @IsString()
  country?: string;
}

@ApiTags('owners')
@Controller('owners')
export class OwnersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('companyId') companyId?: string) {
    return this.prisma.owner.findMany({ where: { companyId }, include: { company: true }, orderBy: { name: 'asc' } });
  }

  @Post()
  create(@Body() dto: OwnerDto) {
    return this.prisma.owner.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<OwnerDto>) {
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.owner.delete({ where: { id } });
  }
}
