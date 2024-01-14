import { AnimeSource } from '../anime.enum';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { tagsToArray } from '../../../common/utils/format-data.util';

export class CreateAnimeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  crew: string;

  @IsString()
  @IsOptional()
  series: string;

  @Transform(({ value }) => tagsToArray(value))
  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString()
  @IsEnum(AnimeSource)
  @IsNotEmpty()
  source: AnimeSource;

  @IsString()
  @IsOptional()
  author: string;
}
