import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthResponseDto, TokensDto, UserResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthMapper {
  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email ?? '',
      username: user.username,
      avatar: user.avatar ?? undefined,
      isSteamLinked: !!user.steamId,
    };
  }

  toAuthResponse(user: User, tokens: TokensDto): AuthResponseDto {
    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }
}