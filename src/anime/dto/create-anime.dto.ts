import { AnimeSource } from '../anime.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnimeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimeSource)
  source: AnimeSource;

  @IsString()
  @IsOptional()
  author: string;
}
