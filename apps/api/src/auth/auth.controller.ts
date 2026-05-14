import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
class AuthDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; @IsOptional() @IsString() name?: string; }
@ApiTags('auth')
@Controller('auth')
export class AuthController { constructor(private auth: AuthService) {} @Post('register') register(@Body() dto: AuthDto) { return this.auth.register(dto.email, dto.password, dto.name); } @Post('login') login(@Body() dto: AuthDto) { return this.auth.login(dto.email, dto.password); } }
