import { AnimeSource } from '../anime.enum';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  crew: string;

  @IsString()
  @IsOptional()
  series: string;

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
