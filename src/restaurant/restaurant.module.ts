import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RestaurantController } from './controller/restaurant.controller';
import { RestaurantService } from './service/restaurant.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, PrismaService],
})
export class RestaurantModule {}
