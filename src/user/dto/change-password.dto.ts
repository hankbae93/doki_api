import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'Password only accepts english and number',
  })
  @IsNotEmpty()
  password: string;
}
