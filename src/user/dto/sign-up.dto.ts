import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: '사용자의 이메일',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      '사용자의 비밀번호, 8~16자의 영어와 숫자만 조합. /^[a-zA-Z0-9]*$',
    example: 'test1234',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'Password only accepts english and number',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '사용자의 닉네임이며 중복은 불가합니다.',
  })
  @MaxLength(12)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    description: '사용자의 자기소개',
  })
  @IsString()
  @IsOptional()
  description: string;
}
