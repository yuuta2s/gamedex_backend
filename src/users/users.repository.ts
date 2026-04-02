// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findBySteamId(steamId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { steamId } });
  }

  async findOrCreateSteamUser(profile: {
    steamId: string;
    username: string;
    avatar?: string;
  }): Promise<User> {
    return this.prisma.user.upsert({
      where: { steamId: profile.steamId },
      update: {},
      create: {
        steamId: profile.steamId,
        username: profile.username,
        avatar: profile.avatar,
        steamDisplayName: profile.username,
      },
    });
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }
}
