import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AgendaCandidateVote } from '../entities/agenda-canidate-vote.entity';
import { User } from '../../user/entities/user.entity';
import { AgendaCandidate } from '../entities/agenda-candidate.entity';

@Injectable()
export class AgendaCandidateVoteRepository extends Repository<AgendaCandidateVote> {
  constructor(private dataSource: DataSource) {
    super(AgendaCandidateVote, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<AgendaCandidateVote> {
    return manager ? manager.getRepository(AgendaCandidateVote) : this;
  }

  insertRecord(user: User, agendaCandidate: AgendaCandidate) {
    return this.insert({
      user,
      agendaCandidate,
    });
  }

  findOneByAgendaCandidate(agendaCandidateId: number, userId: number) {
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
}
