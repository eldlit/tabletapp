import {
  Injectable,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRestaurantDto, RestaurantModel } from '../dto/restaurant.model';
import { plainToClass } from 'class-transformer';
import { JsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async getRestaurantById(
    @Param('id') restaurantId: string,
  ): Promise<RestaurantModel> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { categories: true },
    });

    if (!restaurant) {
      throw new NotFoundException(`No restaurants with ID ${restaurantId}`);
    }

    return plainToClass(RestaurantModel, restaurant, {
      excludeExtraneousValues: true,
    });
  }

  async createRestaurantForOwner(userId: string, dto: CreateRestaurantDto) {
    const { name, settings, operatingHours } = dto;

    const user = await this.prisma.user_table.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return this.prisma.restaurant.create({
      data: {
        name,
        settings: settings || {},
        operating_hours: operatingHours,
        owner_id: userId,
      },
    });
  }

  async getRestaurantSettingsIfOwner(
    user: any,
    restaurantId: string,
  ): Promise<JsonValue> {
    // Step 1: Check if the restaurant exists and belongs to the user
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { settings: true, owner_id: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID '${restaurantId}' not found.`,
      );
    }

    if (restaurant.owner_id !== user.userId || user.userType !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to access this restaurant settings.',
      );
    }

    return restaurant.settings;
  }

  async updateRestaurantSettings(
    user: any,
    restaurantId: string,
    dto: string,
  ): Promise<object> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID '${restaurantId}' not found.`,
      );
    }

    if (restaurant.owner_id !== user.userId || user.userType !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to update this restaurant settings.',
      );
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        settings: dto,
        update_timestamp: new Date(),
      },
      select: { id: true, settings: true, update_timestamp: true },
    });
  }

  async getRestaurantOperatingHours(restaurantId: string): Promise<JsonValue> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { operating_hours: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID '${restaurantId}' not found.`,
      );
    }

    return restaurant.operating_hours || {};
  }

  async updateRestaurantOperatingHours(
    user: any,
    restaurantId: string,
    dto: string,
  ): Promise<object> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID '${restaurantId}' not found.`,
      );
    }

    if (restaurant.owner_id !== user.userId || user.userType !== 'ADMIN') {
      throw new UnauthorizedException(
        "You do not have permission to update this restaurant's operating hours.",
      );
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        operating_hours: dto,
        update_timestamp: new Date(),
      },
      select: { id: true, operating_hours: true, update_timestamp: true },
    });

    return updatedRestaurant;
  }
}
