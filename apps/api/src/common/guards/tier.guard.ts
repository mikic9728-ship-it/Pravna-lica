import { CanActivate, ExecutionContext, Injectable, HttpException } from '@nestjs/common';
@Injectable()
export class ProTierGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const user = context.switchToHttp().getRequest().user;
    if (!user?.subscription || !['PRO', 'ENTERPRISE'].includes(user.subscription.tier)) throw new HttpException('PRO subscription required', 402);
    return true;
  }
}
