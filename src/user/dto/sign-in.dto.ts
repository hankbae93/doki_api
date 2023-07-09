import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: '사용자의 이메일',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: '사용자의 비밀번호',
  })
  @IsString()
  password: string;
}
