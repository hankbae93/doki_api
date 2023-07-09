import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
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
}
