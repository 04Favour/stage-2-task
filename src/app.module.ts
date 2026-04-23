import { Module } from '@nestjs/common';
import { ProfilesController } from './app.controller';
import { ProfilesService } from './app.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { envValidation } from './common/env.validation';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: envValidation,
    envFilePath: '.env'
  })],
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService],
})
export class AppModule {}
