import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRecommendationDto {
  @ApiProperty({
    description: 'ID of the source menu item that is recommending another item.',
    example: 'item-123',
  })
  @IsString()
  @IsNotEmpty()
  sourceItemId: string;

  @ApiProperty({
    description: 'ID of the recommended menu item.',
    example: 'item-456',
  })
  @IsString()
  @IsNotEmpty()
  recommendedItemId: string;
}
