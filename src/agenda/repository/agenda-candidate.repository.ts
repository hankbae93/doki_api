import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AgendaCandidate } from '../entities/agenda-candidate.entity';
import { plainToInstance } from 'class-transformer';
import { GetCurrentCandidateAgendaList } from '../agenda.response';

@Injectable()
export class AgendaCandidateRepository extends Repository<AgendaCandidate> {
  constructor(private dataSource: DataSource) {
    super(AgendaCandidate, dataSource.createEntityManager());
  }

  findNominatingAgendaList(periodId: number): Promise<
    {
      agendaId: number;
      agendaCandidateId: number;
      title: string;
      voteCount: number;
    }[]
  > {
    return this.createQueryBuilder('agendaCandidate')
      .leftJoinAndSelect('agendaCandidate.agenda', 'agenda')
      .leftJoinAndSelect(
        'agendaCandidate.agendaCandidateVotes',
        'agendaCandidateVote',
      )
      .select([
        'agenda.id as agendaId',
        'agendaCandidate.id as agendaCandidateId',
        'agenda.title as title',
        'COUNT(agendaCandidateVote.id) as voteCount',
      ])
      .where('agendaCandidate.agenda_period_id = :periodId', {
        periodId,
      })
      .groupBy('agendaCandidate.id')
      .getRawMany()
      .then((data) => plainToInstance(GetCurrentCandidateAgendaList, data));
  }
}
