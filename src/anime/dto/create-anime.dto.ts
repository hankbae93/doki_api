import { AnimeSource } from '../anime.enum';
import {
  IsEnum,
  isNotEmpty,
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
