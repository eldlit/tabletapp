import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MenuItemService } from '../service/menu-item.service';
import { CreateMenuItemDto, MenuItemOutputDto } from '../dto/menu-item.dto';
import { ItemStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('menu-items')
@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly itemService: MenuItemService) {}

  @ApiOperation({ summary: 'Get menu items by category' })
  @ApiParam({ name: 'category_id', description: 'Category ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Returns menu items for the specified category.',
    type: [MenuItemOutputDto],
  })
  @Get('/all/by-category/:category_id')
  async getMenuItemById(@Param('category_id') categoryId: string) {
    return this.itemService.getMenuItemsByCategory(categoryId);
  }

  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all menu items for the specified restaurant.',
    type: [MenuItemOutputDto],
  })
  @Get('/all/:restaurantId')
  async getMenuItems(@Param('restaurantId') restaurantId: string) {
    if (!restaurantId) {
      throw new BadRequestException('restaurant id is required');
    }

    return this.itemService.getMenuItemsByRestaurantId(restaurantId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Menu item created successfully.',
  })
  @ApiBody({ description: 'Menu item details', type: CreateMenuItemDto })
  @UseGuards(AuthGuard('jwt'))
  @Post('/create-new/:restaurantId')
  async createNewItem(
    @Param('restaurantId') restaurantId: string,
    @Body() menuItemDto: CreateMenuItemDto,
  ) {
    if (!restaurantId || !menuItemDto) {
      throw new BadRequestException('restaurant id and menu item are required');
    }
    return this.itemService.createMenuItem(restaurantId, menuItemDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing menu item' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID',
    required: true,
  })
  @ApiParam({ name: 'itemId', description: 'Menu item ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Menu item updated successfully.',
  })
  @ApiBody({
    description: 'Updated menu item details',
    type: CreateMenuItemDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Put('/update/:restaurantId/:itemId')
  async updateItem(
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() menuItemDto: CreateMenuItemDto,
  ) {
    if (!restaurantId || !itemId || !menuItemDto) {
      throw new BadRequestException(
        'Restaurant ID, item ID, and menu item data are required.',
      );
    }
    return this.itemService.updateMenuItem(restaurantId, itemId, menuItemDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item status' })
  @ApiParam({ name: 'itemId', description: 'Menu item ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Menu item status updated successfully.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ItemStatus),
          example: 'AVAILABLE',
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/update/status/:itemId')
  async updateItemStatus(
    @Param('itemId') itemId: string,
    @Body('status') status: ItemStatus,
  ) {
    if (!itemId || !status) {
      throw new BadRequestException('Item ID and status are required.');
    }

    if (!Object.values(ItemStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status value. Allowed values are: ${Object.values(ItemStatus).join(', ')}.`,
      );
    }

    return this.itemService.updateItemStatus(itemId, status);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiParam({ name: 'itemId', description: 'Menu item ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Menu item deleted successfully.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/delete/:itemId')
  async deleteItem(@Param('itemId') itemId: string) {
    if (!itemId) {
      throw new BadRequestException('Item ID is required for deletion.');
    }

    await this.itemService.deleteMenuItem(itemId);

    return {
      message: `Menu item with ID '${itemId}' successfully deleted.`,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder a menu item' })
  @ApiParam({ name: 'itemId', description: 'Menu item ID', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newIndex: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Menu item reordered successfully.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/reorder/:itemId')
  async reorderItem(
    @Param('itemId') itemId: string,
    @Body('newIndex') newIndex: number,
  ) {
    if (!itemId || newIndex === undefined || newIndex < 0) {
      throw new BadRequestException(
        'Item ID and a valid new index are required.',
      );
    }

    return this.itemService.reorderMenuItem(itemId, newIndex);
  }
}
