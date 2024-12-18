import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Perform user login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({
    description: 'User login details',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'secure_password123' },
      },
    },
  })
  @ApiOperation({ summary: 'Perform user login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({
    description: 'User login details',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'secure_password123' },
      },
    },
  })
  @Post('/login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  @ApiBody({
    description: 'Refresh token payload',
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
      },
    },
  })
  @Post('/refresh-token')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }
}
