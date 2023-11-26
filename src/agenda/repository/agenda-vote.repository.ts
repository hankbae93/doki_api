import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AgendaVote } from '../entities/agenda-vote.entity';
import { Agenda } from '../entities/agenda.entity';
import { AgendaCandidate } from '../entities/agenda-candidate.entity';
import { AgendaOption } from '../entities/agenda-option.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AgendaVoteRepository extends Repository<AgendaVote> {
  constructor(private dataSource: DataSource) {
    super(AgendaVote, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<AgendaVote> {
    return manager ? manager.getRepository(AgendaVote) : this;
  }

  findAgendaVote(agendaCandidateId: number, userId: number) {
    return this.findOne({
      where: {
        agendaCandidate: {
          id: agendaCandidateId,
        },
        user: {
          id: userId,
        },
      },
    });
  }

  findAgendaVoteList(
    agendaCandidateId: number,
    manager?: EntityManager,
  ): Promise<{ count: number; optionId: number; voteId: number }[]> {
    return this.setManager(manager)
      .createQueryBuilder('agendaVote')
      .select([
        'COUNT(*) as count',
        'agendaVote.agenda_option_id  AS optionId',
        'agendaVote.id as voteId',
      ])
      .where('agendaVote.agenda_candidate_id = :agendaCandidateId', {
        agendaCandidateId,
      })
      .groupBy('agendaVote.agenda_option_id')
      .getRawMany()
      .then((data) => {
        return data
          .map((item) => ({ ...item, count: +item.count }))
          .sort((a, b) => b.count - a.count);
      });
  }

  insertRecord(
    agenda: Agenda,
    agendaCandidate: AgendaCandidate,
    agendaOption: AgendaOption,
    user: User,
  ) {
    return this.insert({
      agenda,
      agendaCandidate,
      agendaOption,
      user,
    });
  }
}
