import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import { CompaniesService } from '../companies/companies.service';
@Controller('exports')
export class ExportsController { constructor(private companies: CompaniesService) {} @Get('companies/:id/excel') async excel(@Param('id') id: string, @Res() res: Response) { const company = await this.companies.findOne(id); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(company.financialReports), 'Financials'); const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }); res.setHeader('Content-Disposition', `attachment; filename="${company.slug}.xlsx"`); res.send(buffer); } @Get('companies/:id/pdf') async pdf(@Param('id') id: string, @Res() res: Response) { const company = await this.companies.findOne(id); res.type('application/pdf').send(Buffer.from(`RSBI PDF report placeholder for ${company.name}. Use enterprise renderer in production.`)); } }
