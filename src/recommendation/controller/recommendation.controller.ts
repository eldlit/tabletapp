import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { RecommendationService } from '../service/recommendation.service';
import { CreateRecommendationDto } from '../dto/recommendation.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a recommendation' })
  @ApiBody({
    description: 'Details of the recommendation to create',
    type: CreateRecommendationDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createRecommendation(@Body() createDto: CreateRecommendationDto) {
    const { sourceItemId, recommendedItemId } = createDto;

    if (!sourceItemId || !recommendedItemId) {
      throw new BadRequestException(
        'Source item ID and recommended item ID are required.',
      );
    }

    return this.recommendationService.createRecommendation(
      sourceItemId,
      recommendedItemId,
    );
  }

  @ApiOperation({ summary: 'Get recommendations for a menu item' })
  @ApiParam({
    name: 'sourceItemId',
    description: 'The ID of the source menu item',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of recommendations for the specified source item',
    type: [CreateRecommendationDto],
  })
  @Get('/:sourceItemId')
  async getRecommendations(@Param('sourceItemId') sourceItemId: string) {
    return this.recommendationService.getRecommendations(sourceItemId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder a recommendation' })
  @ApiParam({
    name: 'sourceItemId',
    description: 'The ID of the source menu item',
    required: true,
  })
  @ApiParam({
    name: 'recommendationId',
    description: 'The ID of the recommendation to reorder',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newOrderIndex: {
          type: 'number',
          example: 2,
        },
      },
    },
    description: 'New position for the recommendation',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation reordered successfully',
  })
  @Patch('/reorder/:sourceItemId/:recommendationId')
  async updateRecommendationOrder(
    @Param('sourceItemId') sourceItemId: string,
    @Param('recommendationId') recommendationId: string,
    @Body('newOrderIndex') newOrderIndex: number,
  ) {
    if (newOrderIndex === undefined || newOrderIndex < 0) {
      throw new BadRequestException('A valid new order index is required.');
    }

    return this.recommendationService.updateRecommendationOrder(
      sourceItemId,
      recommendationId,
      newOrderIndex,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a recommendation' })
  @ApiParam({
    name: 'recommendationId',
    description: 'The ID of the recommendation to delete',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation deleted successfully',
  })
  @Delete('/:recommendationId')
  async delete(@Param('recommendationId') recommendationId: string) {
    return this.recommendationService.deleteRecommendation(recommendationId);
  }
}
