import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' }) // Summary for the endpoint
  @ApiBody({
    description: 'Data to create a new user',
    type: CreateUserDto,
  }) // Body schema
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid data',
  })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required.');
    }

    return this.userService.createUser(username, password);
  }
}
