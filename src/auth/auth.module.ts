import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthMapper } from './auth.mapper';

@Module({
  imports: [
    UsersModule, 
    JwtModule,
  ],
  providers: [AuthService, AuthMapper],
  controllers: [AuthController]
})
export class AuthModule {}

