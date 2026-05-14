import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyQueryDto } from './dto';
@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}
  @Get() findAll(@Query() query: CompanyQueryDto) { return this.companies.findAll(query); }
  @Get('search') search(@Query('q') q: string) { return this.companies.search(q); }
  @Get('top/:metric') top(@Param('metric') metric: 'revenue' | 'profit' | 'employeeCount') { return this.companies.top(metric); }
  @Get('compare/list') compare(@Query('ids') ids: string) { return this.companies.compare(ids?.split(',').filter(Boolean) ?? []); }
  @Get(':id') findOne(@Param('id') id: string) { return this.companies.findOne(id); }
}
