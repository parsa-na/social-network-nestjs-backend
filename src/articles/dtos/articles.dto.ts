import { IsNotEmpty, IsString } from 'class-validator';

export class ArticlesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
