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
import { UserDocument } from 'src/users/schema/user.schema';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Email / Password ─────────────────────────────────────────

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
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  signOut(@Req() req: Request) {
    return this.authService.signOut(req.user as UserDocument);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  // ── Steam OAuth ───────────────────────────────────────────────

  /**
   * Step 1: redirect the browser to Steam's login page.
   * Passport handles the redirect automatically.
   */
  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // Passport redirects – nothing to return here
  }

  /**
   * Step 2: Steam redirects back here after the user logs in.
   * Passport validates the OpenID assertion and attaches req.user.
   * We issue our own JWT tokens and redirect the client.
   */
  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  async steamCallback(@Req() req: Request, @Res() res: Response) {
    const authResponse = await this.authService.signInWithSteam(
      req.user as UserDocument,
    );

    // Option A – SPA: redirect to frontend with tokens in query params
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const { accessToken, refreshToken } = authResponse.tokens;
    return res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );

    // Option B – Return JSON directly (comment out redirect above, uncomment below)
    // return res.json(authResponse);
  }
}
