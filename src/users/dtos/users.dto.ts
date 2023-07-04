import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class UserDto {
  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  password: string;
}
