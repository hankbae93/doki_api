import { IsNotEmpty, IsNumber } from 'class-validator';

export class VoteAgendaDto {
  @IsNumber()
  @IsNotEmpty()
  optionId: number;
}
