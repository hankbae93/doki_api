import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetAnimeByPageDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  limit: number;
}
