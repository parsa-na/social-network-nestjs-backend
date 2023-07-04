import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dtos/users.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        bio: true,
        article: true,
        followedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        following: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            article: true,
            followedBy: true,
            following: true,
          },
        },
      },
    });
  }

  async createUser(userd: UserDto) {
    const { password } = userd;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      await this.prisma.user.create({
        data: {
          username: userd.username,
          bio: userd.bio,
          email: userd.email,
          password: hash,
        },
      });
    } catch (err) {
      if (err.code == 'P2002') {
        throw new BadRequestException('this username already exists!!!');
      }
    }
  }

  async findUser(id: number) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          id,
        },
        include: {
          article: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          followedBy: {
            select: {
              username: true,
              id: true,
            },
          },
          following: {
            select: {
              username: true,
              id: true,
            },
          },
          _count: {
            select: {
              article: true,
              followedBy: true,
              following: true,
            },
          },
        },
      });

      const { password, ...rest } = user;
      return rest;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: data.username },
    });

    if (!data.password) throw new ForbiddenException();
    const resault = await bcrypt.compare(data.password, user.password);
    if (!resault) throw new ForbiddenException();
    const jwt = await this.jwtService.signAsync(
      {
        id: user.id,
        username: user.username,
      },
      {
        secret: this.config.get<string>('JWT_SECRET'),
      },
    );
    return { token: jwt, username: user.username, id: user.id };
  }

  async deleteUser(id: number) {
    try {
      await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async followUser(id: number, userId: number) {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          followedBy: {
            connect: { id: userId },
          },
        },
      });
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async unFollowUser(id: number, userId: number) {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          followedBy: {
            disconnect: { id: userId },
          },
        },
      });
    } catch (err) {
      throw new BadRequestException();
    }
  }
}
