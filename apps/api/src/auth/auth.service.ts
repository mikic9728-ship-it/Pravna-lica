import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
@Injectable()
export class AuthService { constructor(private prisma: PrismaService, private jwt: JwtService) {} async register(email: string, password: string, name?: string) { const passwordHash = await bcrypt.hash(password, 12); const user = await this.prisma.user.create({ data: { email, name, passwordHash, apiKey: crypto.randomUUID(), subscription: { create: { tier: 'FREE' } } } }); return this.token(user.id, user.email); } async login(email: string, password: string) { const user = await this.prisma.user.findUnique({ where: { email } }); if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException(); return this.token(user.id, user.email); } token(sub: string, email: string) { return { accessToken: this.jwt.sign({ sub, email }) }; } }
