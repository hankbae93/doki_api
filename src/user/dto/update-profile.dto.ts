import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserRank } from '../user.enum';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(12)
  @IsNotEmpty()
  @IsOptional()
  nickname: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  rank: UserRank;

  @IsString()
  @IsOptional()
  profile: string;
}
