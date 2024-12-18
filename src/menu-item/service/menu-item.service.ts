import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuItemDto, MenuItemOutputDto } from '../dto/menu-item.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemStatus } from '@prisma/client';

@Injectable()
export class MenuItemService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenuItemsByCategory(
    categoryId: string,
  ): Promise<MenuItemOutputDto[]> {
    const menuItems = await this.prisma.menu_item.findMany({
      where: { category_id: categoryId },
      include: {
        recommendationsAsSource: true,
        recommendationsAsTarget: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    return plainToInstance(MenuItemOutputDto, menuItems, {
      excludeExtraneousValues: true,
    });
  }

  async getMenuItemsByRestaurantId(
    restaurantId: string,
  ): Promise<MenuItemOutputDto[]> {
    const menuItems = await this.prisma.menu_item.findMany({
      where: { restaurant_id: restaurantId },
    });

    if (!menuItems) {
      throw new NotFoundException('Menu item not found');
    }

    return plainToInstance(MenuItemOutputDto, menuItems, {
      excludeExtraneousValues: true,
    });
  }

  async createMenuItem(restaurantId: string, dto: CreateMenuItemDto) {
    const {
      title,
      subtitle,
      price,
      foodKey,
      showDuringBreakfast,
      dietaryInfo,
      categoryId,
    } = dto;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new BadRequestException(
        `Restaurant with ID '${restaurantId}' does not exist.`,
      );
    }

    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, restaurant_id: restaurantId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID '${categoryId}' does not exist or does not belong to the specified restaurant.`,
      );
    }

    const maxOrderIndex = await this.prisma.menu_item.aggregate({
      where: { category_id: categoryId },
      _max: { orderIndex: true },
    });

    const nextOrderIndex = (maxOrderIndex._max.orderIndex || 0) + 1;

    return this.prisma.menu_item.create({
      data: {
        title,
        subtitle,
        price,
        foodKey,
        showDuringBreakfast: showDuringBreakfast || false,
        dietaryInfo,
        category_id: categoryId,
        restaurant_id: restaurantId,
        orderIndex: nextOrderIndex,
      },
    });
  }

  async updateMenuItem(
    restaurantId: string,
    itemId: string,
    dto: CreateMenuItemDto,
  ) {
    const {
      title,
      subtitle,
      price,
      foodKey,
      showDuringBreakfast,
      dietaryInfo,
      categoryId,
    } = dto;

    const existingItem = await this.prisma.menu_item.findFirst({
      where: { id: itemId, restaurant_id: restaurantId },
    });

    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, restaurant_id: restaurantId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID '${categoryId}' does not exist or does not belong to the specified restaurant.`,
      );
    }

    if (!existingItem) {
      throw new NotFoundException(
        `Menu item with ID '${itemId}' does not exist for restaurant '${restaurantId}'.`,
      );
    }

    return this.prisma.menu_item.update({
      where: { id: itemId },
      data: {
        title,
        subtitle,
        price,
        foodKey,
        showDuringBreakfast: showDuringBreakfast || false,
        dietaryInfo,
        category_id: categoryId,
        restaurant_id: restaurantId,
        updatedAt: new Date(),
      },
    });
  }

  async updateItemStatus(itemId: string, status: ItemStatus) {
    const existingItem = await this.prisma.menu_item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException(
        `Menu item with ID '${itemId}' does not exist.`,
      );
    }

    return this.prisma.menu_item.update({
      where: { id: itemId },
      data: {
        status,
      },
    });
  }

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const existingItem = await this.prisma.menu_item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menu_item.delete({
      where: { id: itemId },
    });

    return true;
  }

  async reorderMenuItem(itemId: string, newIndex: number) {
    const targetItem = await this.prisma.menu_item.findUnique({
      where: { id: itemId },
    });

    if (!targetItem) {
      throw new NotFoundException(`Menu item with ID '${itemId}' not found.`);
    }

    if (targetItem.orderIndex === newIndex) {
      throw new BadRequestException(
        `This item is already at the index '${newIndex}'`,
      );
    }

    const categoryId = targetItem.category_id;

    const items = await this.prisma.menu_item.findMany({
      where: { category_id: categoryId },
      orderBy: { orderIndex: 'asc' },
    });

    if (newIndex < 0 || newIndex >= items.length) {
      throw new BadRequestException(`New index '${newIndex}' is out of range.`);
    }

    const reorderedItems = items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({ ...item, orderIndex: index }));

    reorderedItems.splice(newIndex, 0, { ...targetItem, orderIndex: newIndex });

    const updatePromises = reorderedItems.map((item, index) =>
      this.prisma.menu_item.update({
        where: { id: item.id },
        data: { orderIndex: index },
      }),
    );

    await Promise.all(updatePromises);

    return {
      message: `Menu item '${itemId}' successfully moved to position ${newIndex}.`,
    };
  }
}
