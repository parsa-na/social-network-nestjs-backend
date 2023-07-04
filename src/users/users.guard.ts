import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
@Injectable()
export class IsLoggedInGuard implements CanActivate {
  constructor(private jwtService: JwtService, private config: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = req.cookies.token.token;
    //console.log(token);
    //const token = this.takaJwt(auth);

    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      req['user'] = data;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  // takaJwt(data: string) {
  //   const firstPart = data.split(' ')[0];
  //   if (
  //     firstPart !== 'Bearer' &&
  //     (data.split(' ')[0] != undefined || data.split(' ')[0] != '')
  //   )
  //     throw new UnauthorizedException();
  //   const token = data.split(' ')[1];

  //   return token;
  // }
}

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;
    console.log(user);

    const userRole = (
      await this.prisma.user.findFirst({
        where: { id: user.id },
      })
    ).role;

    if (userRole == 'ADMIN') return true;
    else throw new UnauthorizedException('you must be admin!!!!!');
  }
}
