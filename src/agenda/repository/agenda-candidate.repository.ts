import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AgendaCandidate } from '../entities/agenda-candidate.entity';
import { plainToInstance } from 'class-transformer';

import { Agenda } from '../entities/agenda.entity';
import { AgendaPeriod } from '../entities/agenda-period.entity';
import {
  FindNominatingAgendaList,
  FindTopAgendaList,
} from './agenda.transform';

@Injectable()
export class AgendaCandidateRepository extends Repository<AgendaCandidate> {
  constructor(private dataSource: DataSource) {
    super(AgendaCandidate, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<AgendaCandidate> {
    return manager ? manager.getRepository(AgendaCandidate) : this;
  }

  findCandidateAgendaById(id: number) {
    return this.findOne({
      where: {
        id,
      },
      relations: ['agenda'],
    });
  }

  findCandidateAgendaByAgendaId(agendaId: number) {
    return this.findOne({
      where: {
        agenda: {
          id: agendaId,
        },
      },
      relations: ['agenda'],
    });
  }

  findNominatingAgenda(agendaId: number, periodId: number) {
    return this.findOneBy({
      agenda: {
        id: agendaId,
      },
      agendaPeriod: {
        id: periodId,
      },
    });
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
      .then((data) => plainToInstance(FindNominatingAgendaList, data));
  }

  findWinnerAgendaListByPeriod(periodId: number) {
    return this.find({
      where: [
        {
          priority: true,
          agendaPeriod: {
            id: periodId,
          },
        },
        {
          nominated: true,
          agendaPeriod: {
            id: periodId,
          },
        },
      ],
      relations: ['agenda'],
    });
  }

  findTopAgendaList(periodId: number, manger?: EntityManager) {
    return this.setManager(manger)
      .createQueryBuilder('agenda_candidate')
      .leftJoin('agenda_candidate.agendaCandidateVotes', 'agendaCandidateVote')
      .leftJoin('agenda_candidate.agenda', 'agenda')
      .select([
        'agenda_candidate.id as agendaCandidateId',
        'agenda.title as title',
        'COUNT(`agendaCandidateVote`.`id`) as voteCount',
      ])
      .where('agenda_candidate.agenda_period_id = :periodId', {
        periodId,
      })
      .groupBy('agenda_candidate.id')
      .having('voteCount > 0')
      .orderBy('voteCount', 'DESC')
      .limit(3)
      .getRawMany()
      .then((data) => plainToInstance(FindTopAgendaList, data));
  }

  findCandidateAgenda(periodId: number): Promise<{
    agendaCandidateId: number;
    nominateCount: number;
    title: string;
    options: { optionId: number; optionContent: string }[];
  }> {
    return this.createQueryBuilder('agenda_candidate')
      .leftJoin('agenda_candidate.agenda', 'agenda')
      .leftJoin('agenda.agendaOptions', 'agenda_option')
      .leftJoin(
        'agenda_candidate.agendaCandidateVotes',
        'agenda_candidate_vote',
      )
      .select([
        'agenda_option.id as optionId',
        'agenda.title as title',
        'agenda_candidate.id as agendaCandidateId',
        'agenda_option.content as optionContent',
        'COUNT(agenda_candidate_vote.id) as nominateCount',
      ])
      .where('agenda_candidate.agenda_period_id = :periodId ', {
        periodId,
      })
      .andWhere('agenda_candidate.nominated = TRUE')
      .groupBy('agenda_candidate.id, agenda_option.id')
      .getRawMany()
      .then((data) => {
        return {
          agendaCandidateId: data[0].agendaCandidateId,
          nominateCount: +data[0].nominateCount,
          title: data[0].title,
          options: data.reduce((acc, cur) => {
            if (acc.some((item) => item.optionId === cur.optionId)) {
              return acc;
            }

            acc.push({
              optionId: cur.optionId,
              content: cur.optionContent,
            });

            return acc;
          }, []),
        };
      });
  }

  findVotingAgenda(periodId: number, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {
        nominated: true,
        agendaPeriod: {
          id: periodId,
        },
      },
      relations: ['agenda'],
    });
  }

  updateNominated(agendaCandidateId: number, manger?: EntityManager) {
    return this.setManager(manger).update(agendaCandidateId, {
      nominated: true,
    });
  }

  updatePriority(agendaCandidateIds: number[], manger?: EntityManager) {
    return this.setManager(manger).update(agendaCandidateIds, {
      priority: true,
    });
  }

  updateAgendaPeriod(agendaCandidateId: number, agendaPeriod: AgendaPeriod) {
    return this.update(agendaCandidateId, {
      agendaPeriod,
    });
  }

  saveRecord(agenda: Agenda, agendaPeriod: AgendaPeriod) {
    return this.save({
      agenda,
      agendaPeriod,
      priority: false,
      nominated: false,
    });
  }
}
