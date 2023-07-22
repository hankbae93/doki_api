import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AnimeOrder, AnimeSource } from '../anime.enum';
import { Transform } from 'class-transformer';
import { toNumber } from '../../common/utils/format-data';

export class GetAllAnimeQueryDto {
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  page = 1;

  @Transform(({ value }) => toNumber(value, { default: 10, min: 10 }))
  @IsNumber()
  @IsNotEmpty()
  limit = 10;

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
