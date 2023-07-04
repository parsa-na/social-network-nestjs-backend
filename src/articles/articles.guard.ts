import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class isOwnerGuard implements CanActivate {
  constructor(
    private articleServer: ArticlesService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = context.switchToHttp().getRequest().user;
    const role = (await this.prisma.user.findFirst({ where: { id: user.id } }))
      .role;

    if (role === 'ADMIN') return true;
    const data: number = parseInt(req.params.id);
    const article = await this.articleServer.getArticle(data);
    if (article.authorId == user.id) return true;
    else
      throw new UnauthorizedException('you are not the writer of article!!!');
  }
}
