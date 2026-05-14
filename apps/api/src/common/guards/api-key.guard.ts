import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const key = req.headers['x-api-key'];
    if (!key || Array.isArray(key)) throw new UnauthorizedException('Missing API key');
    const user = await this.prisma.user.findFirst({ where: { apiKey: key, subscription: { active: true } } });
    if (!user) throw new UnauthorizedException('Invalid API key');
    return true;
  }
}
