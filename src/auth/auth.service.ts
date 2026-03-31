import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  AuthResponseDto,
  CreateUserDto,
  SignInDto,
  TokensDto,
} from './dto/auth.dto';
import { UserDocument } from 'src/users/schema/user.schema';
import { UsersRepository } from 'src/users/users.repository';
import { AuthMapper } from './auth.mapper';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // Sign Up (email + password)
  // ──────────────────────────────────────────────────────────────

  async signUp(dto: CreateUserDto): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  // ──────────────────────────────────────────────────────────────
  // Sign In (email + password)
  // ──────────────────────────────────────────────────────────────

  async signIn(dto: SignInDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  // ──────────────────────────────────────────────────────────────
  // Sign In with Steam (called after Passport validates the user)
  // ──────────────────────────────────────────────────────────────

  async signInWithSteam(user: UserDocument): Promise<AuthResponseDto> {
    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  // ──────────────────────────────────────────────────────────────
  // Refresh Tokens
  // ──────────────────────────────────────────────────────────────

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokensDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user, hashedRefresh);

    return tokens;
  }

  // ──────────────────────────────────────────────────────────────
  // Sign Out
  // ──────────────────────────────────────────────────────────────

  async signOut(user: UserDocument): Promise<void> {
    await this.usersRepository.updateRefreshToken(user, null);
  }

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  private generateTokens(user: UserDocument): TokensDto {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'change_me',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET}_refresh`,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}