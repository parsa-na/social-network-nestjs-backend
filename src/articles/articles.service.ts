import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArticlesDto } from './dtos/articles.dto';
import { UpdataArticlesDto } from './dtos/updateArticles.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllArticles() {
    return await this.prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: { username: true },
        },
        comments: {
          include: {
            belowComments: true,
          },
        },
        likedByUsers: {
          select: {
            username: true,
            id: true,
          },
        },
        _count: {
          select: {
            likedByUsers: true,
            comments: true,
          },
        },
      },
    });
  }

  async getArticle(id: number) {
    try {
      const article = await this.prisma.article.findFirstOrThrow({
        where: {
          id,
        },
        include: {
          comments: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          likedByUsers: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              likedByUsers: true,
              comments: true,
            },
          },
        },
      });

      return article;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async createArticle(data: ArticlesDto, userId: number) {
    await this.prisma.article.create({
      data: {
        authorId: userId,
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateArticle(data: UpdataArticlesDto, id: number) {
    return await this.prisma.article.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteArticle(id: number) {
    //  await this.isOwnerOfArticle(id, userId);
    await this.prisma.article.delete({
      where: {
        id,
      },
    });
  }

  async isOwnerOfArticle(id: number, userId: number) {
    const article = await this.prisma.article.findFirst({
      where: { id },
    });
    if (article.authorId !== userId)
      throw new UnauthorizedException('you are not the writer of article!!!');
  }

  async likeArticle(articleId: number, userId: number) {
    try {
      const data = await this.prisma.article.update({
        where: {
          id: articleId,
        },
        select: {
          _count: {
            select: {
              likedByUsers: true,
            },
          },
          likedByUsers: {
            select: {
              id: true,
            },
          },
        },
        data: {
          likedByUsers: {
            connect: { id: userId },
          },
        },
      });

      return data._count;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async unLikeArticle(articleId: number, userId: number) {
    try {
      const data = await this.prisma.article.update({
        where: {
          id: articleId,
        },
        select: {
          _count: {
            select: {
              likedByUsers: true,
            },
          },
          likedByUsers: {
            select: {
              id: true,
            },
          },
        },
        data: {
          likedByUsers: {
            disconnect: { id: userId },
          },
        },
      });

      return data._count;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  checkIsLikedUser(data: any, userId: number) {
    const likes = data.likedByUsers.map((value) => value.id);
    if (likes.includes(userId)) {
      data['isLiked'] = true;
    } else data['isLiked'] = false;
    return data.isLiked;
  }

  async isLikedUser(id: number, userId: number) {
    const data = await this.prisma.article.findFirstOrThrow({
      where: {
        id,
      },
      select: {
        likedByUsers: {
          select: {
            id: true,
          },
        },
      },
    });
    return this.checkIsLikedUser(data, userId);
  }
}
