import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: SignInDto) {
    // find user by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credentials Incorrect');
    }

    // compare hash
    const pwdMatches = await argon.verify(user.hash, dto.password);
    if (!pwdMatches) {
      throw new ForbiddenException('Credentials Incorrect');
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }

  async signup(dto: SignUpDto) {
    try {
      // generate hash
      const hash = await argon.hash(dto.password);

      // save user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      } else throw error;
    }
  }
}
