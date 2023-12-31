import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { NICKNAME_MAX_LENGTH } from '../user.constant';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(NICKNAME_MAX_LENGTH)
  @IsNotEmpty()
  @IsOptional()
  nickname: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  profile: string;
}
