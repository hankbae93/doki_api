import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'Password only accepts english and number',
  })
  @IsNotEmpty()
  password: string;

  @MaxLength(12)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsOptional()
  description: string;
}
