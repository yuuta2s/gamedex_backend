import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  providers: [UsersService, UsersRepository, PrismaModule],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
