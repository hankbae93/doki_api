import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AnimeOrder, AnimeSource } from '../anime.enum';

export class GetAllAnimeDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsEnum(AnimeSource)
  @IsString()
  source: AnimeSource;

  @IsOptional()
  @IsEnum(AnimeOrder)
  @IsString()
  order: AnimeOrder;
}
