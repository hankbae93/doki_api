import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(12)
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsOptional()
  description: string;
}
