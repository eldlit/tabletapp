import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/service/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Validate the user
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      user_type: user.user_type,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_ACCESS_EXPIRATION}s`,
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_REFRESH_EXPIRATION}s`,
      }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      return {
        access_token: this.jwtService.sign(
          {
            username: payload.username,
            sub: payload.sub,
            user_type: payload.user_type,
          },
          { expiresIn: `${process.env.JWT_ACCESS_EXPIRATION}s` },
        ),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
