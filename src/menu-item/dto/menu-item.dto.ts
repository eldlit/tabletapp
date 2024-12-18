import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendationOutputDto {
  @ApiProperty({
    description: 'Unique identifier for the recommendation',
    example: 'rec-123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID of the recommended menu item',
    example: 'item-456',
  })
  @Expose()
  recommendedItemId: string;

  @ApiProperty({
    description: 'Order index for the recommendation',
    example: 1,
  })
  @Expose()
  orderIndex: number;

  @ApiProperty({
    description: 'Timestamp when the recommendation was created',
    example: '2024-12-17T12:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the recommendation was last updated',
    example: '2024-12-18T12:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}

export class CategoryOutputDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Starters',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Type of the category',
    example: 'FOOD',
  })
  @Expose()
  @Transform(({ obj }) => obj.category_type)
  categoryType: string;

  @ApiProperty({
    description: 'Position index of the category for ordering purposes',
    example: 2,
  })
  @Expose()
  @Transform(({ obj }) => obj.order_index)
  positionIndex: number;
}

export class MenuItemOutputDto {
  @ApiProperty({
    description: 'Unique identifier of the menu item',
    example: 'item-123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Localized titles for the menu item',
    example: { en: 'Pasta', fr: 'Pâtes' },
  })
  @Expose()
  title: Record<string, string>;

  @ApiProperty({
    description: 'Localized subtitles for the menu item',
    example: { en: 'With tomato sauce', fr: 'Avec sauce tomate' },
    required: false,
  })
  @Expose()
  subtitle?: Record<string, string>;

  @ApiProperty({
    description: 'Price of the menu item',
    example: '12.99',
  })
  @Expose()
  price: string;

  @ApiProperty({
    description: 'Unique food key for the menu item',
    example: 'pasta-123',
  })
  @Expose()
  foodKey: string;

  @ApiProperty({
    description: 'Indicates if the menu item is available during breakfast',
    example: true,
  })
  @Expose()
  showDuringBreakfast: boolean;

  @ApiProperty({
    description: 'Dietary information for the menu item',
    example: { vegetarian: true, glutenFree: false },
    required: false,
  })
  @Expose()
  dietaryInfo?: Record<string, any>;

  @ApiProperty({
    description: 'Category details for the menu item',
    type: CategoryOutputDto,
  })
  @Expose()
  @Type(() => CategoryOutputDto)
  category: CategoryOutputDto;

  @ApiProperty({
    description: 'Order index of the menu item for ordering purposes',
    example: 1,
  })
  @Expose()
  orderIndex: number;

  @ApiProperty({
    description: 'Status of the menu item',
    example: 'AVAILABLE',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'List of recommendations where this item is the source',
    type: [RecommendationOutputDto],
    required: false,
  })
  @Expose()
  @Type(() => RecommendationOutputDto)
  recommendationsAsSource?: RecommendationOutputDto[];

  @ApiProperty({
    description: 'List of recommendations where this item is the target',
    type: [RecommendationOutputDto],
    required: false,
  })
  @Expose()
  @Type(() => RecommendationOutputDto)
  recommendationsAsTarget?: RecommendationOutputDto[];
}

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Localized titles for the menu item',
    example: { en: 'Pizza', fr: 'Pizza' },
  })
  @IsNotEmpty()
  @IsObject()
  title: Record<string, string>;

  @ApiProperty({
    description: 'Localized subtitles for the menu item',
    example: { en: 'With extra cheese', fr: 'Avec fromage supplémentaire' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  subtitle?: Record<string, string>;

  @ApiProperty({
    description: 'Price of the menu item',
    example: '15.99',
  })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({
    description: 'Unique food key for the menu item',
    example: 'pizza-123',
  })
  @IsNotEmpty()
  @IsString()
  foodKey: string;

  @ApiProperty({
    description: 'Indicates if the menu item is available during breakfast',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showDuringBreakfast?: boolean;

  @ApiProperty({
    description: 'Dietary information for the menu item',
    example: { vegan: true, nutFree: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  dietaryInfo?: Record<string, any>;

  @ApiProperty({
    description: 'Category ID of the menu item',
    example: 'category-456',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
