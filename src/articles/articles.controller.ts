import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesDto } from './dtos/articles.dto';
import { User } from 'src/users/users.decorator';

import { IsLoggedInGuard } from 'src/users/users.guard';
import { UpdataArticlesDto } from './dtos/updateArticles.dto';

import { isOwnerGuard } from './articles.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}
  @Get()
  async getAll() {
    return await this.articleService.getAllArticles();
  }

  @Get(':id')
  async getArticle(@Param('id') id: number) {
    return await this.articleService.getArticle(id);
  }

  @Post()
  @UseGuards(IsLoggedInGuard)
  async createArticle(@Body() data: ArticlesDto, @User() user) {
    return await this.articleService.createArticle(data, user.id);
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(IsLoggedInGuard, isOwnerGuard)
  async updateArticle(
    @Body() data: UpdataArticlesDto,
    @Param('id') id: number,
    @User() user,
  ) {
    console.log(user.id);
    return this.articleService.updateArticle(data, id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(IsLoggedInGuard, isOwnerGuard)
  async deleteArticle(@Param('id') id: number) {
    await this.articleService.deleteArticle(id);
  }

  @Put('like/:id')
  @UseGuards(IsLoggedInGuard)
  async likeArticle(@Param('id') id: number, @User() user) {
    await this.articleService.likeArticle(id, user.id);
  }

  @Put('unlike/:id')
  @UseGuards(IsLoggedInGuard)
  async unlikeArticle(@Param('id') id: number, @User() user) {
    await this.articleService.unLikeArticle(id, user.id);
  }
}
