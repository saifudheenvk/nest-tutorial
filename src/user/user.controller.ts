import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
  constructor() {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyDetails(@GetUser() user: User) {
    return user;
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  editUser(@GetUser('id') id: number) {
    return id;
  }
}
