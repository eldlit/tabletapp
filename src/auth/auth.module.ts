import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller/auth.controller';
import { JwtStrategy } from './service/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './service/auth.service';
import { UserService } from '../user/service/user.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: `${process.env.JWT_ACCESS_EXPIRATION}s` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserService, PrismaService],
})
export class AuthModule {}
