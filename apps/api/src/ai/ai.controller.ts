import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma/prisma.service';
@ApiTags('ai')
@Controller('ai')
export class AiController { private client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : undefined; constructor(private prisma: PrismaService) {} @Post('ask') async ask(@Body('question') question: string) { const context = await this.prisma.company.findMany({ include: { address: true, industry: true }, orderBy: [{ revenue: 'desc' }], take: 25 }); if (!this.client) return { answer: 'OPENAI_API_KEY nije podešen. Primjer upita je interpretiran lokalno.', results: context }; const completion = await this.client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'Answer in Bosnian/Serbian/Croatian using only provided company JSON. Mention when data is unavailable.' }, { role: 'user', content: `${question}\nDATA:${JSON.stringify(context)}` }] }); return { answer: completion.choices[0]?.message.content, results: context }; } }
