import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AnimeSource } from '../anime.enum';

export class UpdateAnimeDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  author?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tag?: string;

  @IsEnum(AnimeSource)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  source?: AnimeSource;
}
