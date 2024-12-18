import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToClass } from 'class-transformer';
import { CategoryModel, CreateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategoryById(@Param('id') id: string): Promise<CategoryModel> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return plainToClass(CategoryModel, category, {
      excludeExtraneousValues: true,
    });
  }

  async getCategoriesByRestaurant(
    restaurantId: string,
  ): Promise<CategoryModel[]> {
    const categories = await this.prisma.category.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { order_index: 'asc' },
    });

    if (!categories || categories.length === 0) {
      throw new NotFoundException(
        `No categories found for restaurant with ID ${restaurantId}`,
      );
    }

    return plainToClass(CategoryModel, categories, {
      excludeExtraneousValues: true,
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const { name, categoryType, restaurantId } = dto;

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        restaurant_id: restaurantId,
        name: name,
        category_type: categoryType,
      },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name '${name}' and type '${categoryType}' already exists for this restaurant.`,
      );
    }

    const maxPosition = await this.prisma.category.aggregate({
      where: { restaurant_id: restaurantId },
      _max: { order_index: true },
    });

    if (!maxPosition) {
      throw new BadRequestException('Invalid input data');
    }

    const nextPosition = (maxPosition._max.order_index || 0) + 1;

    return this.prisma.category.create({
      data: {
        name,
        category_type: categoryType,
        restaurant_id: restaurantId,
        order_index: nextPosition,
      },
    });
  }

  async updateCategory(categoryId: string, dto: CreateCategoryDto) {
    const { name, categoryType, restaurantId } = dto;

    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new BadRequestException(
        `Category with ID '${categoryId}' does not exist.`,
      );
    }

    const conflictingCategory = await this.prisma.category.findFirst({
      where: {
        restaurant_id: restaurantId,
        category_type: categoryType,
        NOT: { id: categoryId },
      },
    });

    if (conflictingCategory) {
      throw new BadRequestException(
        `A category with type '${categoryType}' already exists for this restaurant.`,
      );
    }

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        category_type: categoryType,
        restaurant_id: restaurantId,
        update_timestamp: new Date(), // Ensure timestamp updates
      },
    });
  }

  async deleteCategory(categoryId: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new BadRequestException(
        `A category with id '${categoryId}' does not exist.`,
      );
    }

    this.prisma.category.delete({ where: { id: categoryId } });
  }

  async reorder(categoryId: string, newIndex: number) {
    const targetCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!targetCategory) {
      throw new BadRequestException(
        `Category with ID '${categoryId}' does not exist.`,
      );
    }

    const currentIndex = targetCategory.order_index;

    if (currentIndex === newIndex) {
      throw new BadRequestException(
        'Category is already at the specified index.',
      );
    }

    if (newIndex < currentIndex) {
      await this.prisma.$transaction([
        this.prisma.category.updateMany({
          where: {
            order_index: { gte: newIndex, lt: currentIndex },
          },
          data: { order_index: { increment: 1 } },
        }),
        this.prisma.category.update({
          where: { id: categoryId },
          data: { order_index: newIndex },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.category.updateMany({
          where: {
            order_index: { gt: currentIndex, lte: newIndex },
          },
          data: { order_index: { decrement: 1 } },
        }),
        this.prisma.category.update({
          where: { id: categoryId },
          data: { order_index: newIndex },
        }),
      ]);
    }

    return { message: 'Category reordered successfully.' };
  }
}
