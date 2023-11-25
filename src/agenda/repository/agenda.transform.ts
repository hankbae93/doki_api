import { Transform } from 'class-transformer';
import { toNumber } from '../../common/utils/format-data';

export class FindNominatingAgendaList {
  @Transform(({ value }) => toNumber(value))
  agendaId: number;
  @Transform(({ value }) => toNumber(value))
  agendaCandidateId: number;
  title: string;
  @Transform(({ value }) => toNumber(value))
  voteCount: number;
}

export class FindTopAgendaList {
  @Transform(({ value }) => toNumber(value))
  agendaCandidateId: number;
  title: string;
  @Transform(({ value }) => toNumber(value))
  voteCount: number;
}
