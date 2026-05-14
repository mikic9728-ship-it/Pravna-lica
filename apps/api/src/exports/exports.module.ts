import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { ExportsController } from './exports.controller';
@Module({ imports: [CompaniesModule], controllers: [ExportsController] })
export class ExportsModule {}
