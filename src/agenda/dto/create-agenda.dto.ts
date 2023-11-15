import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateAgendaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Array should have at least 2 items' })
  @ArrayMaxSize(5, { message: 'Array should have at most 2 items' })
  options: string[];
}
