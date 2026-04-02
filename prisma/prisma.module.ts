import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ← rend PrismaService disponible partout sans avoir à importer PrismaModule dans chaque module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}