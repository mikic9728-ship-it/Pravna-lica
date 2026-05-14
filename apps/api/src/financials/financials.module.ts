import { Module } from '@nestjs/common';
import { FinancialsController } from './financials.controller';
@Module({ controllers: [FinancialsController] })
export class FinancialsModule {}
