import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UserDto } from './dtos/users.dto';
import { LoginDto } from './dtos/login.dto';
import { IsAdminGuard, IsLoggedInGuard } from './users.guard';
import { UseGuards } from '@nestjs/common';
import { User } from './users.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly config: ConfigService,
  ) {}
  @Get()
  async getAll() {
    return await this.userService.findAll();
  }

  @Post('register')
  @HttpCode(201)
  async createUser(@Body() data: UserDto) {
    await this.userService.createUser(data);
    return {
      massage: 'you registered!!!',
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.userService.login(data);
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: this.config.get<string>('MODE') === 'production',
        sameSite: 'strict',
      })
      .send({ username: token.username, id: token.id });
    //console.log(token);
    // return token;
  }

  @Get('logout')
  @HttpCode(200)
  @UseGuards(IsLoggedInGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token').json({ message: 'you logged out!!!' });
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUser(id);
  }

  @Delete(':id')
  @UseGuards(IsLoggedInGuard, IsAdminGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @Put('follow/:id')
  @UseGuards(IsLoggedInGuard)
  async followUser(@Param('id') id: number, @User() user) {
    await this.userService.followUser(id, parseInt(user.id));
  }

  @Put('unfollow/:id')
  @UseGuards(IsLoggedInGuard)
  async unFollowUser(@Param('id') id: number, @User() user) {
    await this.userService.unFollowUser(id, parseInt(user.id));
  }
}
