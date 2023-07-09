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
import { ApiProperty } from '@nestjs/swagger';

export class GetAllAnimeQueryDto {
  @ApiProperty({
    description: '페이지 숫자',
    required: false,
    default: 1,
  })
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    description: '한 페이지에 담을 아이템 수',
    required: false,
    default: 10,
  })
  @Transform(({ value }) => toNumber(value, { default: 10, min: 10 }))
  @IsNumber()
  @IsNotEmpty()
  limit: number = 10;

  @ApiProperty({
    description: '해당 문자열을 포함하는 제목을 검색합니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    description: '해당 문자열과 일치하는 태그를 검색합니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  tag: string;

  @ApiProperty({
    description: '해당 출처와 일치하는 아이템을 검색합니다.',
    required: false,
    enum: AnimeSource,
  })
  @IsOptional()
  @IsEnum(AnimeSource)
  @IsString()
  source: AnimeSource;

  @ApiProperty({
    description: '최신순, 옛날순으로 검색합니다.',
    required: false,
    enum: AnimeOrder,
  })
  @IsOptional()
  @IsEnum(AnimeOrder)
  @IsString()
  order: AnimeOrder;
}
