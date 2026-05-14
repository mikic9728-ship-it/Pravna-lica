import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
@Module({ imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.get('JWT_SECRET', 'dev-secret'), signOptions: { expiresIn: '1d' } }) })], providers: [AuthService], controllers: [AuthController], exports: [AuthService] })
export class AuthModule {}
