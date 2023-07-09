import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: '사용자의 닉네임이며 중복은 불가합니다.',
  })
  @IsString()
  @MaxLength(12)
  @IsNotEmpty()
  @IsOptional()
  nickname: string;

  @ApiProperty({
    description: '사용자의 자기소개',
  })
  @IsString()
  @IsOptional()
  description: string;
}
