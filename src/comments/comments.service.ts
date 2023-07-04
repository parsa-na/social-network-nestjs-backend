import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dtos/createComment.dto';
import { UpdateCommentDto } from './dtos/updateComment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommentforArticle(id: number) {
    return await this.prisma.comment.findMany({
      where: {
        article: {
          id,
        },
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async createCommentForArticle(data: CreateCommentDto, authorId: number) {
    const comment = await this.prisma.comment.create({
      data: {
        text: data.text,
        articleId: Number(data.articleId),
        authorId,
      },
    });

    await this.prisma.article.update({
      where: {
        id: Number(data.articleId),
      },
      data: {
        comments: {
          connect: {
            id: comment.id,
          },
        },
      },
    });
  }

  async createCommentForComment(data: CreateCommentDto, userId: number) {
    return await this.prisma.comment.create({
      data: {
        text: data.text,
        upperCommentId: Number(data.articleId),
        authorId: userId,
      },
    });
  }

  async updateComment(data: UpdateCommentDto, id: number, userId: number) {
    await this.isOwnerOfComment(id, userId);
    return await this.prisma.comment.update({
      where: {
        id,
      },
      data,
    });
  }

  async isOwnerOfComment(id: number, userId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id },
    });
    if (comment.authorId !== userId)
      throw new UnauthorizedException('you are not the writer of comment!!!');
  }
}
