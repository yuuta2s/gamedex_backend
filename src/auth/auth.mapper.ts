import { Injectable } from '@nestjs/common';

import { UserDocument } from 'src/users/schema/user.schema';
import { AuthResponseDto, TokensDto, UserResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthMapper {
  toUserResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email ?? '',
      username: user.username,
      avatar: user.avatar,
      isSteamLinked: !!user.steamId,
    };
  }

  toAuthResponse(user: UserDocument, tokens: TokensDto): AuthResponseDto {
    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }
}
