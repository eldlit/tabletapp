import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for the new user',
    example: 'exampleUser',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  username: string;

  @ApiProperty({
    description: 'Password for the new user (minimum 6 characters)',
    example: 'strongPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;
}
