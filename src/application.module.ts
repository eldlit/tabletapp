import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { RecommendationModule } from './recommendation/recommendation.module.';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    MenuItemModule,
    RecommendationModule,
    RestaurantModule,
    UserModule,
  ],
})
export class ApplicationModule {}
