import { IsString, IsNotEmpty } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryModel {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: 1,
  })
  @Expose()
  id: number;

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
    description: 'Position index of the category',
    example: 2,
  })
  @Expose()
  @Transform(({ obj }) => obj.order_index)
  positionIndex: number;

  @ApiProperty({
    description: 'ID of the restaurant the category belongs to',
    example: 101,
  })
  @Expose()
  @Transform(({ obj }) => obj.restaurant_id)
  restaurantId: number;

  @ApiProperty({
    description: 'Timestamp when the category was created',
    example: '2024-12-17T12:00:00.000Z',
  })
  @Expose()
  @Type(() => Date)
  creationTimestamp: Date;

  @ApiProperty({
    description: 'Timestamp when the category was last updated',
    example: '2024-12-18T12:00:00.000Z',
  })
  @Expose()
  @Type(() => Date)
  updateTimestamp: Date;
}

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Starters',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the category',
    example: 'FOOD',
  })
  @IsNotEmpty()
  @IsString()
  categoryType: string;

  @ApiProperty({
    description: 'ID of the restaurant the category belongs to',
    example: 'restaurant-id-123',
  })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}
