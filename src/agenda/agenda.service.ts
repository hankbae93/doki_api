import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Agenda } from './entities/agenda.entity';
import { AgendaOption } from './entities/agenda-option.entity';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { AgendaCandidate } from './entities/agenda-candidate.entity';
import { AgendaPeriodType } from './agenda.enum';
import { AgendaCandidateVote } from './entities/agenda-canidate-vote.entity';
import { AgendaPeriodService } from './agenda-period.service';
import { AgendaVote } from './entities/agenda-vote.entity';
import { VoteAgendaDto } from './dto/vote-agenda.dto';
import { AgendaRepository } from './repository/agenda.repository';
import { AgendaPeriodRepository } from './repository/agenda-period.repository';
import { AgendaCandidateRepository } from './repository/agenda-candidate.repository';
import { AgendaOptionRepository } from './repository/agenda-option.repository';

@Injectable()
export class AgendaService {
  constructor(
    private readonly agendaRepository: AgendaRepository,
    private readonly agendaPeriodRepository: AgendaPeriodRepository,
    private readonly agendaCandidateRepository: AgendaCandidateRepository,
    private readonly agendaOptionRepository: AgendaOptionRepository,

    @InjectRepository(AgendaCandidateVote)
    private agendaCandidateVoteRepository: Repository<AgendaCandidateVote>,

    @InjectRepository(AgendaVote)
    private agendaVoteRepository: Repository<AgendaVote>,

    private dataSource: DataSource,

    private agendaPeriodService: AgendaPeriodService,
  ) {}

  async getAgendaList() {
    const agendaList = await this.agendaRepository.findAgendaList();

    const result = agendaList.map((agenda) => {
      return {
        ...agenda,
        agendaOptions: agenda.agendaOptions.map((option) => ({
          ...option,
          optionId: option.id,
        })),
      };
    });

    return new ResponseDto(EStatusCode.OK, result, EResponseMessage.SUCCESS);
  }

  async getCurrentCandidateAgendaList() {
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();
    const agendaCandidateList =
      await this.agendaCandidateRepository.findNominatingAgendaList(
        currentPeriod.id,
      );

    return new ResponseDto(
      EStatusCode.OK,
      {
        period: currentPeriod,
        list: agendaCandidateList,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async createAgenda(createAgendaDto: CreateAgendaDto, user: User) {
    const { title, options } = createAgendaDto;
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();
    if (currentPeriod.type !== AgendaPeriodType.READY) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAgenda = await this.agendaRepository.saveRecord(
        title,
        user,
        queryRunner.manager,
      );
      const agendaOptions = await this.agendaOptionRepository.saveRecords(
        options,
        newAgenda,
        queryRunner.manager,
      );

      const newOptions = agendaOptions.map((option) => ({
        id: option.id,
        content: option.content,
      }));
      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.CREATED,
        {
          agendaId: newAgenda.id,
          title: newAgenda.title,
          options: newOptions,
        },
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async candidateAgenda(agendaId: number, user: User) {
    const currentPeriod = await this.agendaPeriodService.getCurrentPeriod();

    if (currentPeriod.type !== AgendaPeriodType.CANDIDATE) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const agendaCandidate = await this.agendaCandidateRepository.findOneBy({
      agenda: {
        id: agendaId,
      },
      agendaPeriod: {
        id: currentPeriod.id,
      },
    });

    if (agendaCandidate) {
      const candidateVote = await this.agendaCandidateVoteRepository.findOne({
        where: {
          agendaCandidate: {
            id: agendaCandidate.id,
          },
          user: {
            id: user.id,
          },
        },
      });

      if (candidateVote) {
        await this.agendaCandidateVoteRepository.remove(candidateVote);
        return new ResponseDto(EStatusCode.OK, null, EResponseMessage.CANCEL);
      }

      await this.agendaCandidateVoteRepository.save({
        agendaCandidate: agendaCandidate,
        user,
      });

      return new ResponseDto(
        EStatusCode.OK,
        null,
        EResponseMessage.CANDIDATE_SUCCESS,
      );
    }

    if (!agendaCandidate) {
      const candiAgenda = await this.agendaRepository.findOne({
        where: {
          id: agendaId,
        },
      });

      const newCandidateAgenda = await this.agendaCandidateRepository.save({
        agenda: candiAgenda,
        agendaPeriod: currentPeriod,
        priority: false,
        nominated: false,
      });

      await this.agendaCandidateVoteRepository.save({
        user,
        agendaCandidate: newCandidateAgenda,
      });
    } else {
      await this.agendaCandidateVoteRepository.save({
        user,
        agendaCandidate: agendaCandidate,
      });
    }

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.CANDIDATE_SUCCESS,
    );
  }

  async getWinnerAgendaListByPeriod(periodId: number) {
    const period = await this.agendaPeriodRepository.findOne({
      where: {
        id: periodId,
      },
    });

    if (!period) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    const winners = await this.agendaCandidateRepository.find({
      where: [
        {
          priority: true,
          agendaPeriod: {
            id: period.id,
          },
        },
        {
          nominated: true,
          agendaPeriod: {
            id: period.id,
          },
        },
      ],
      relations: ['agenda'],
    });

    return new ResponseDto(EStatusCode.OK, winners, EResponseMessage.SUCCESS);
  }

  async nominateAgenda() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const agendaPeriodRepository =
      this.dataSource.manager.getRepository(AgendaPeriod);
    const agendaCandidateRepository =
      this.dataSource.manager.getRepository(AgendaCandidate);

    const currentPeriod = await agendaPeriodRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    if (!currentPeriod) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const data = await agendaCandidateRepository
      .createQueryBuilder('agenda_candidate')
      .leftJoin('agenda_candidate.agendaCandidateVotes', 'agendaCandidateVote')
      .leftJoin('agenda_candidate.agenda', 'agenda')
      .select([
        'agenda_candidate.id as agendaCandidateId',
        'agenda.title as title',
        'COUNT(`agendaCandidateVote`.`id`) as voteCount',
      ])
      .where('agenda_candidate.agenda_period_id = :periodId', {
        periodId: currentPeriod.id,
      })
      .groupBy('agenda_candidate.id')
      .having('voteCount > 0')
      .orderBy('voteCount', 'DESC')
      .limit(3)
      .getRawMany();

    const candidates = data.map((record) => {
      return {
        ...record,
        voteCount: +record.voteCount,
      };
    });

    const winner = candidates.shift();

    try {
      await agendaCandidateRepository.update(+winner.agendaCandidateId, {
        nominated: true,
      });

      await agendaCandidateRepository.update(
        candidates.map((candidate) => +candidate.agendaCandidateId),
        {
          priority: true,
        },
      );

      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.OK,
        {
          winner,
          list: candidates,
        },
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return new ResponseDto(EStatusCode.SERVER_ERROR, null, 'retry');
    } finally {
      await queryRunner.release();
    }
  }

  async getAgendaForVote() {
    const [period, currentPeriod] =
      await this.agendaPeriodService.getLastCandidatePeriod();

    const data = await this.agendaCandidateRepository
      .createQueryBuilder('agenda_candidate')
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
        'COUNT(agenda_candidate_vote.id) as voteCount',
      ])
      .where('agenda_candidate.agenda_period_id = :periodId ', {
        periodId: currentPeriod.id,
      })
      .andWhere('agenda_candidate.nominated = TRUE')
      .groupBy('agenda_candidate.id, agenda_option.id')
      .getRawMany();

    if (!data[0]) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return new ResponseDto(
      EStatusCode.OK,
      {
        period,
        agendaCandidateId: data[0].agendaCandidateId,
        title: data[0].title,
        voteCount: +data[0].voteCount,
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
      },
      EResponseMessage.SUCCESS,
    );
  }

  async voteAgenda(
    agendaCandidateId: number,
    voteAgendaDto: VoteAgendaDto,
    user: User,
  ) {
    const { optionId } = voteAgendaDto;

    const agendaCandidate = await this.agendaCandidateRepository.findOne({
      where: {
        id: agendaCandidateId,
      },
      relations: ['agenda'],
    });

    const agenda = await this.agendaRepository.findOne({
      where: {
        id: agendaCandidate.agenda.id,
      },
      relations: ['agendaOptions'],
    });

    const agendaOption = agenda.agendaOptions.find(
      (item) => item.id === optionId,
    );

    if (!agendaOption) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    const vote = await this.agendaVoteRepository.findOne({
      where: {
        agendaCandidate: {
          id: agendaCandidateId,
        },
        user: {
          id: user.id,
        },
      },
    });
    if (vote) {
      await this.agendaVoteRepository.remove(vote);
      return new ResponseDto(EStatusCode.OK, null, EResponseMessage.CANCEL);
    }

    await this.agendaVoteRepository.save({
      agenda: agendaCandidate.agenda,
      agendaCandidate,
      agendaOption,
      user,
      win: false,
    });

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.SUCCESS);
  }

  async winAgendaVoteThisWeek() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const agendaPeriodRepository =
      this.dataSource.manager.getRepository(AgendaPeriod);
    const agendaRepository = this.dataSource.manager.getRepository(Agenda);
    const agendaOptionRepository = this.dataSource.getRepository(AgendaOption);
    const agendaVoteRepository =
      this.dataSource.manager.getRepository(AgendaVote);

    try {
      const [currentPeriod, prevPeriod] = await agendaPeriodRepository.find({
        where: {},
        order: { id: 'DESC' },
        take: 2,
      });
      if (!this.agendaPeriodService.validTime(currentPeriod.endTime)) {
        throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
      }

      const currentAgenda = await this.agendaCandidateRepository.findOne({
        where: {
          nominated: true,
          agendaPeriod: {
            id: prevPeriod.id,
          },
        },
        relations: ['agenda'],
      });

      const agendaVotes = await agendaVoteRepository
        .createQueryBuilder('agendaVote')
        .select([
          'COUNT(*) as count',
          'agendaVote.agenda_option_id  AS optionId',
          'agendaVote.id as id',
        ])
        .where('agendaVote.agenda_candidate_id = :id', { id: currentAgenda.id })
        .groupBy('agendaVote.agenda_option_id')
        .getRawMany();

      await agendaOptionRepository.update(+agendaVotes[0].optionId, {
        win: true,
      });

      await agendaRepository.update(+currentAgenda.agenda.id, {
        complete: true,
      });
      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.OK,
        agendaVotes[0],
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return new ResponseDto(EStatusCode.SERVER_ERROR, null, 'retry');
    } finally {
      await queryRunner.release();
    }
  }
}
