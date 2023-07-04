import { PartialType } from '@nestjs/mapped-types';
import { ArticlesDto } from './articles.dto';

export class UpdataArticlesDto extends PartialType(ArticlesDto) {}
