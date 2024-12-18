import { Expose, Transform, Type } from 'class-transformer';
import { CategoryModel } from '../../category/dto/category.dto';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestaurantModel {
  @ApiProperty({
    description: 'Unique identifier of the restaurant',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Name of the restaurant',
    example: 'Tasty Diner',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Optional settings for the restaurant',
    example: '{"theme": "modern"}',
    required: false,
  })
  @Expose()
  @Transform(({ value }) => (value === null ? undefined : value), {
    toClassOnly: true,
  })
  settings?: string;

  @ApiProperty({
    description: 'Operating hours of the restaurant',
    example: { open: '08:00 AM', close: '10:00 PM' },
  })
  @Expose()
  @Transform(({ obj }) => obj.operating_hours, { toClassOnly: true })
  operationHours: string;

  @ApiProperty({
    description: 'List of categories associated with the restaurant',
    type: () => [CategoryModel],
  })
  @Expose()
  @Type(() => CategoryModel)
  categories: CategoryModel[];
}

export class OperatingHoursDto {
  @ApiProperty({
    description: 'Opening time of the restaurant',
    example: '08:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  readonly open: string;

  @ApiProperty({
    description: 'Closing time of the restaurant',
    example: '10:00 PM',
  })
  @IsString()
  @IsNotEmpty()
  readonly close: string;
}

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Name of the restaurant',
    example: 'Tasty Diner',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Additional settings for the restaurant',
    example: '{"theme": "modern"}',
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly settings?: string;

  @ApiProperty({
    description: 'Operating hours for the restaurant',
    type: OperatingHoursDto,
  })
  @IsObject()
  @IsNotEmpty()
  @Type(() => OperatingHoursDto)
  readonly operatingHours: string;
}


