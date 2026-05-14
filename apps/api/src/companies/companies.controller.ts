import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyQueryDto, CreateCompanyDto, UpdateCompanyDto } from './dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get()
  findAll(@Query() query: CompanyQueryDto) {
    return this.companies.findAll(query);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.companies.search(q);
  }

  @Get('facets')
  facets() {
    return this.companies.facets();
  }

  @Get('fastest-growing')
  fastestGrowing(@Query('limit') limit?: string) {
    return this.companies.fastestGrowing(limit ? Number(limit) : 10);
  }

  @Get('top/:metric')
  top(@Param('metric') metric: 'revenue' | 'profit' | 'employeeCount', @Query('limit') limit?: string) {
    return this.companies.top(metric, limit ? Number(limit) : 10);
  }

  @Get('compare/list')
  compare(@Query('ids') ids: string) {
    return this.companies.compare(ids?.split(',').filter(Boolean) ?? []);
  }

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companies.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companies.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companies.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companies.remove(id);
  }
}
