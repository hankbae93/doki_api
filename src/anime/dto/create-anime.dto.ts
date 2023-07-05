import { AnimeResource } from '../anime.enum';
import { IsNotEmpty } from 'class-validator';

export class CreateAnimeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  tag: string;

  @IsNotEmpty()
  source: AnimeResource;
}
