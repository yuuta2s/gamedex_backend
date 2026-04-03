import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

import {
  AuthResponseDto,
  CreateUserDto,
  SignInDto,
  TokensDto,
} from './dto/auth.dto';
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

  async signUp(dto: CreateUserDto): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.usersRepository.create({
      ...dto,
      passwordHash,
    });

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  async signIn(dto: SignInDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  async signInWithSteam(user: User): Promise<AuthResponseDto> {
    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return this.authMapper.toAuthResponse(user, tokens);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user?.refreshToken)
      throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async signOut(userId: string): Promise<void> {
    await this.usersRepository.updateRefreshToken(userId, null);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  private generateTokens(user: User): TokensDto {
    const payload = {
      userId: user.id,
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