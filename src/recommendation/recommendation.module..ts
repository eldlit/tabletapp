import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationController } from './controller/recommendation.controller';
import { RecommendationService } from './service/recommendation.service';

@Module({
  imports: [AuthModule],
  controllers: [RecommendationController],
  providers: [RecommendationService, PrismaService],
})
export class RecommendationModule {}
