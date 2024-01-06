import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { AnimeSource } from '../anime.enum';

export class UpdateAnimeDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsString()
  @IsOptional()
  crew: string;

  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString()
  @IsEnum(AnimeSource)
  @IsOptional()
  source: AnimeSource;

  @IsString()
  @IsOptional()
  author: string;
}
