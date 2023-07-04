import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      signOptions: {
        expiresIn: '10m',
      },
    }),
  ],
})
export class UsersModule {}
