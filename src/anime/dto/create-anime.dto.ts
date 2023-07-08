import { AnimeSource } from '../anime.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnimeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  tag: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimeSource)
  source: AnimeSource;
}
