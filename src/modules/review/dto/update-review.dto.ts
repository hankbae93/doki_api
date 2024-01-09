import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @IsOptional()
  score: number;

  @IsNumber()
  @IsOptional()
  animeId: number;
}
