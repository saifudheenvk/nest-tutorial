import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }
  async getUserById(userId: number) {
    this.logger.debug('Calling get user by id');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    delete user.hash;
    return user;
  }
}
