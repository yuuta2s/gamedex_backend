import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { UserDocument } from 'src/users/schema/user.schema';
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

    super({
      returnURL,
      realm,
      apiKey,
    });
  }

  /**
   * Called by Passport after Steam redirects back.
   * `profile` is the Steam profile from the OpenID response.
   */
  async validate(
    _identifier: string,
    profile: {
      id: string;
      displayName: string;
      photos?: { value: string }[];
    },
  ): Promise<UserDocument> {
    const avatar = profile.photos?.[0]?.value;

    const user = await this.usersRepository.findOrCreateSteamUser({
      steamId: profile.id,
      username: profile.displayName,
      avatar,
    });

    return user;
  }
}
