import { Module } from '@nestjs/common';
import { CategoryService } from './service/category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryController } from './controller/category.controller';
import { AuthModule } from '../auth/auth.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { MenuItemModule } from '../menu-item/menu-item.module';

@Module({
  imports: [AuthModule, RestaurantModule, MenuItemModule],
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService],
})
export class CategoryModule {}
