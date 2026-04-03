import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, SignInDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  signOut(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.signOut(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  // Steam OAuth routes
  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {}


  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  async steamCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const authResponse = await this.authService.signInWithSteam(user);
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${authResponse.tokens.accessToken}`
    );
  }
}