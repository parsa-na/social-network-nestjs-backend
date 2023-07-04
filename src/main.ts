import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  app.use(cookieParser());
  const p = app.get(PrismaService);
  await p.enableShutdownHooks(app);
  await app.listen(3000);
}
bootstrap();
