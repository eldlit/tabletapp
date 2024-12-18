import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CreateRestaurantDto, RestaurantModel } from '../dto/restaurant.model';
import { RestaurantService } from '../service/restaurant.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid restaurant ID.' })
  @Get()
  async getRestaurantById(
    @Query('restaurantId') restaurantId: string,
  ): Promise<RestaurantModel> {
    if (!restaurantId || restaurantId.length < 0) {
      throw new BadRequestException(`id ${restaurantId} not found`);
    }
    return this.restaurantService.getRestaurantById(restaurantId);
  }

  @ApiOperation({ summary: 'Create a new restaurant for a user' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/create/:userId')
  async createRestaurant(
    @Param('userId') userId: string,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    if (!userId || !createRestaurantDto) {
      throw new BadRequestException(
        'User ID and restaurant data are required.',
      );
    }

    return this.restaurantService.createRestaurantForOwner(
      userId,
      createRestaurantDto,
    );
  }

  @ApiOperation({ summary: 'Fetch all restaurants created by user' })
  @ApiResponse({
    status: 200,
    description: 'Restaurants retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'User ID is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/all/:userId')
  async getAllUserRestaurants(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const user = req.user;

    console.log('get all restaurants requested for user ', user.userId);
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.restaurantService.getAllUserRestaurants(userId, user);
  }

  @ApiOperation({ summary: 'Get restaurant settings if the user is the owner' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/:restaurantId/settings')
  async getSettings(
    @Param('restaurantId') restaurantId: string,
    @Request() req: any,
  ) {
    const user = req.user;
    console.log('user requested restaurant settings', user);

    if (!user) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return this.restaurantService.getRestaurantSettingsIfOwner(
      user,
      restaurantId,
    );
  }

  @ApiOperation({ summary: 'Update restaurant settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:restaurantId/settings')
  async updateSettings(
    @Param('restaurantId') restaurantId: string,
    @Body() updateSettingsDto: string,
    @Request() req: any,
  ) {
    const user = req.user;

    if (!restaurantId || !updateSettingsDto) {
      throw new BadRequestException(
        ' restaurant ID and update settings are required.',
      );
    }

    return this.restaurantService.updateRestaurantSettings(
      user,
      restaurantId,
      updateSettingsDto,
    );
  }

  @ApiOperation({ summary: 'Update restaurant operating hours' })
  @ApiResponse({
    status: 200,
    description: 'Operating hours updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:restaurantId/operating-hours')
  async updateOperatingHours(
    @Param('restaurantId') restaurantId: string,
    @Request() req: any,
    @Body() updateOperatingHoursDto: string,
  ) {
    const userId = req.user;

    if (!updateOperatingHoursDto || !restaurantId) {
      throw new BadRequestException(
        'invalid input data, restaurantId and update settings are required.',
      );
    }

    return this.restaurantService.updateRestaurantOperatingHours(
      userId,
      restaurantId,
      updateOperatingHoursDto,
    );
  }

  @ApiOperation({ summary: 'Get restaurant operating hours' })
  @ApiResponse({ status: 200, description: 'Operating hours retrieved.' })
  @ApiResponse({ status: 400, description: 'Restaurant ID is required.' })
  @Get('/:restaurantId/operating-hours')
  async getOperatingHours(@Param('restaurantId') restaurantId: string) {
    if (!restaurantId) {
      throw new BadRequestException('Restaurant ID is required.');
    }

    return this.restaurantService.getRestaurantOperatingHours(restaurantId);
  }
}
