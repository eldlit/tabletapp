import { Module } from '@nestjs/common';
import { MenuItemService } from './service/menu-item.service';
import { MenuItemController } from './controller/menu-item.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [MenuItemService, PrismaService],
  controllers: [MenuItemController],
})
export class MenuItemModule {}
