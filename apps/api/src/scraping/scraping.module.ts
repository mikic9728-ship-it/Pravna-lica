import { Module } from '@nestjs/common';
import { ScrapingEngine } from './engine/scraping.engine';
@Module({ providers: [ScrapingEngine], exports: [ScrapingEngine] })
export class ScrapingModule {}
