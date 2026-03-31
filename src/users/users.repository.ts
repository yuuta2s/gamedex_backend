import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/auth.dto';
import { User, UserDocument } from './schema/user.schema';


@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto & { password?: string }): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findBySteamId(steamId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ steamId }).exec();
  }

  /**
   * Create a user from Steam profile (no password).
   * If user already exists (by steamId), return existing.
   */
  async findOrCreateSteamUser(profile: {
    steamId: string;
    username: string;
    avatar?: string;
  }): Promise<UserDocument> {
    let user = await this.findBySteamId(profile.steamId);
    if (!user) {
      user = new this.userModel({
        steamId: profile.steamId,
        username: profile.username,
        avatar: profile.avatar,
        steamDisplayName: profile.username,
      });
      await user.save();
    }
    return user;
  }

  async updateRefreshToken(
    user: UserDocument,
    hashedToken: string | null,
  ): Promise<void> {
    user.refreshToken = hashedToken ?? undefined;
    await user.save();
  }
}
