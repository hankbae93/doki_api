import { AnimeSource } from '../anime.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnimeDto {
  @ApiProperty({
    description: '애니메이션 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '애니메이션 제작진/작가',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: '애니메이션의 장르',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;

  @ApiProperty({
    description: '애니메이션 원작',
    enum: AnimeSource,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimeSource)
  source: AnimeSource;
}
