import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AnimeSource } from '../anime.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnimeDto {
  @ApiProperty({
    description: '애니메이션 제목',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '애니메이션 제작진/작가',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: '애니메이션의 장르',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tag?: string;

  @ApiProperty({
    description: '애니메이션 원작',
    enum: AnimeSource,
  })
  @IsEnum(AnimeSource)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  source?: AnimeSource;
}
