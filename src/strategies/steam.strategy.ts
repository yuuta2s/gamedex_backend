import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { User } from '@prisma/client';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private readonly usersRepository: UsersRepository) {
    const returnURL = process.env.STEAM_RETURN_URL;
    const realm = process.env.STEAM_REALM;
    const apiKey = process.env.STEAM_API_KEY;

    if (!returnURL || !realm || !apiKey) {
      throw new Error('Steam environment variables are missing');
    }

    super({ returnURL, realm, apiKey });
  }

  async validate(
    _identifier: string,
    profile: {
      id: string;
      displayName: string;
      photos?: { value: string }[];
    },
  ): Promise<User> {
    const avatar = profile.photos?.[0]?.value;

    return this.usersRepository.findOrCreateSteamUser({
      steamId: profile.id,
      username: profile.displayName,
      avatar,
    });
  }
}