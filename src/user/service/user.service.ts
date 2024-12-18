import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user_table.findUnique({ where: { username } });
  }

  async createUser(username: string, password: string) {
    const existingUser = await this.prisma.user_table.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user_table.create({
      data: {
        username,
        password: hashedPassword,
        user_type: 'USER',
      },
      select: {
        id: true,
        username: true,
        user_type: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
