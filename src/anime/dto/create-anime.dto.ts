import { AnimeSource } from '../anime.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnimeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimeSource)
  source: AnimeSource;
}
