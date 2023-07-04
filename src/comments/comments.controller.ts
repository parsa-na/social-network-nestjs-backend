import {
  Controller,
  Post,
  Param,
  Get,
  UseGuards,
  Body,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { IsLoggedInGuard } from 'src/users/users.guard';
import { CreateCommentDto } from './dtos/createComment.dto';
import { User } from 'src/users/users.decorator';
import { UpdateCommentDto } from './dtos/updateComment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async getCommentforArticle(@Param('id') id: number) {
    try {
      const comments = await this.commentsService.getCommentforArticle(id);
      return comments;
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Post('article')
  @UseGuards(IsLoggedInGuard)
  async createCommentForArticle(@Body() data: CreateCommentDto, @User() user) {
    return await this.commentsService.createCommentForArticle(
      data,

      user.id,
    );
  }

  @Post('comment')
  @UseGuards(IsLoggedInGuard)
  async createCommentForComment(@Body() data: CreateCommentDto, @User() user) {
    return await this.commentsService.createCommentForComment(data, user.id);
  }

  @Put(':id')
  @UseGuards(IsLoggedInGuard)
  async updateComment(
    @Body() data: UpdateCommentDto,
    @Param('id') id: number,
    @User() user,
  ) {
    return await this.commentsService.updateComment(data, id, user.id);
  }
}
