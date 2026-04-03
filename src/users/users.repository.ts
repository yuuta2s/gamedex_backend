// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSteamUserDto, CreateUserDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findBySteamId(steamId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { steamId } });
  }

async create(dto: CreateUserDto & { passwordHash: string }): Promise<User> {
  return this.prisma.user.create({
    data: {
      email: dto.email,
      username: dto.username,
      avatar: dto.avatar,
      passwordHash: dto.passwordHash,
    },
  });
}

async findOrCreateSteamUser(dto: CreateSteamUserDto): Promise<User> {
  return this.prisma.user.upsert({
    where: { steamId: dto.steamId },
    update: {},
    create: {
      steamId: dto.steamId,
      username: dto.username,
      avatar: dto.avatar,
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
