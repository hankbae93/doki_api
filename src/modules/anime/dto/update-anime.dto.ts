import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AnimeSource } from '../anime.enum';

export class UpdateAnimeDto {
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
  crew: string;

  @IsArray()
  tags: string[];

  @IsString()
  @IsEnum(AnimeSource)
  @IsNotEmpty()
  source: AnimeSource;

  @IsString()
  @IsOptional()
  author: string;
}
