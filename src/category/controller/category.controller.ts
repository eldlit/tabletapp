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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from '../service/category.service';
import { CategoryModel, CreateCategoryDto } from '../dto/category.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiQuery({ name: 'id', required: true, description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the category details',
    type: CategoryModel,
  })
  @Get('/byId')
  async getCategoryById(@Query('id') id: string): Promise<CategoryModel> {
    if (!id) {
      throw new BadRequestException('id is required');
    }
    return await this.categoryService.getCategoryById(id);
  }

  @ApiOperation({ summary: 'Get all categories for a restaurant' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID to fetch categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of categories for the restaurant',
    type: [CategoryModel],
  })
  @Get('/all')
  async getAllCategories(
    @Query('restaurantId') restaurantId: string,
  ): Promise<CategoryModel[]> {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId is required');
    }
    return this.categoryService.getCategoriesByRestaurant(restaurantId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiBody({
    description: 'Details for creating a category',
    type: CreateCategoryDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('/create')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto) {
      throw new BadRequestException('category to create is required');
    }
    return this.categoryService.createCategory(createCategoryDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Category ID to update',
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiBody({
    description: 'Updated category details',
    type: CreateCategoryDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Put('/update-category/:id')
  async updateExistingCategory(
    @Param() id: string,
    @Body() newCategoryDto: CreateCategoryDto,
  ) {
    if (!id || !newCategoryDto) {
      throw new BadRequestException('id and category update are required');
    }
    return this.categoryService.updateCategory(id, newCategoryDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Category ID to delete',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/delete-category/:id')
  async deleteCategory(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('id is required');
    }
    return this.categoryService.deleteCategory(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder a category' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Category ID to reorder',
  })
  @ApiBody({
    description: 'New position index for the category',
    schema: {
      type: 'object',
      properties: {
        newIndex: { type: 'integer', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Category reordered successfully' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/reorder/:id')
  async reorderCategory(
    @Param('id') categoryId: string,
    @Body('newIndex') newIndex: number,
  ) {
    if (!categoryId || !newIndex) {
      throw new BadRequestException('categoryId and newIndex are required');
    }
    return this.categoryService.reorder(categoryId, newIndex);
  }
}
