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
import { MILLISECONDS_A_DAY } from '../common/constants/time';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,

    @InjectRepository(AgendaOption)
    private agendaOptionRepository: Repository<AgendaOption>,

    @InjectRepository(AgendaPeriod)
    private agendaPeriodRepository: Repository<AgendaPeriod>,

    @InjectRepository(AgendaCandidate)
    private agendaCandidateRepository: Repository<AgendaCandidate>,

    @InjectRepository(AgendaCandidateVote)
    private agendaCandidateVoteRepository: Repository<AgendaCandidateVote>,

    @InjectRepository(AgendaVote)
    private agendaVoteRepository: Repository<AgendaVote>,

    private dataSource: DataSource,

    private agendaPeriodService: AgendaPeriodService,
  ) {}

  async getAgendaList() {
    const agendaList = await this.agendaRepository.find({
      where: {
        complete: false,
      },
      relations: ['agendaOptions'],
    });

    const result = agendaList.map((agenda) => ({
      ...agenda,
      options: agenda.agendaOptions.map((option) => ({
        option_id: option.id,
        content: option.content,
      })),
    }));

    return new ResponseDto(EStatusCode.OK, result, EResponseMessage.SUCCESS);
  }

  // FIXME: Rollback transaction 처리 필요
  async createAgenda(createAgendaDto: CreateAgendaDto, user: User) {
    const { title, options } = createAgendaDto;
    const currentPeriod = await this.agendaPeriodService.getCurrentPeriod();

    if (currentPeriod.type !== AgendaPeriodType.READY) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const newAgenda = await this.agendaRepository.save({
      title,
      user,
      complete: false,
    });

    const agendaOptions = await this.agendaOptionRepository.save(
      options.map((content) => ({
        content,
        win: false,
        agenda: newAgenda,
      })),
    );

    const newOptions = agendaOptions.map((option) => ({
      id: option.id,
      content: option.content,
    }));

    return new ResponseDto(
      EStatusCode.CREATED,
      {
        agendaId: newAgenda.id,
        title: newAgenda.title,
        options: newOptions,
      },
      EResponseMessage.SUCCESS,
    );
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
      .leftJoin('agenda', 'agenda', 'agenda.id = agenda_candidate.agenda_id ')
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

    const winner = candidates[0];
    const result = [];

    try {
      if (winner) {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + MILLISECONDS_A_DAY);

        if (
          currentPeriod &&
          startTime.getTime() < currentPeriod.endTime.getTime()
        ) {
          throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
        }

        function getType(type: AgendaPeriodType) {
          switch (type) {
            case AgendaPeriodType.READY:
              return AgendaPeriodType.CANDIDATE;
            case AgendaPeriodType.CANDIDATE:
              return AgendaPeriodType.VOTE;
            case AgendaPeriodType.VOTE:
              return AgendaPeriodType.READY;
            default:
              return AgendaPeriodType.READY;
          }
        }

        await agendaPeriodRepository.insert({
          startTime,
          endTime,
          type: getType(currentPeriod?.type),
        });

        await agendaCandidateRepository.update(+winner.agendaCandidateId, {
          nominated: true,
        });

        candidates.map(async (agenda, index) => {
          if (index === 0) return;
          await agendaCandidateRepository.update(+agenda.agendaCandidateId, {
            priority: true,
          });
        });
      }

      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.OK,
        {
          winner: candidates[0],
          list: candidates.slice(1),
        },
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      return new ResponseDto(EStatusCode.SERVER_ERROR, null, 'retry');
    }
  }

  async getAgendaForVote() {
    const [period, currentPeriod] =
      await this.agendaPeriodService.getLastCandidatePeriod();

    // FIXME : class-transformer 통해서 객체화 하기
    const data = await this.agendaCandidateRepository
      .createQueryBuilder('agenda_candidate')
      .leftJoin('agenda', 'agenda', 'agenda.id = agenda_candidate.agenda_id')
      .leftJoin(
        'agenda_option',
        'agenda_option',
        'agenda_option.agenda_id = agenda.id',
      )
      .select([
        'agenda_option.id as optionId',
        'agenda.title as title',
        'agenda_candidate.id as agendaCandidateId',
        'agenda_option.content as optionContent',
      ])
      .where('agenda_candidate.agenda_period_id = :periodId ', {
        periodId: currentPeriod.id,
      })
      .andWhere('agenda_candidate.nominated = TRUE')
      .getRawMany();

    if (!data) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return {
      period,
      agenda: {
        agendaCandidateId: data[0].agendaCandidateId,
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
      },
    };
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
    const [currentPeriod, period] =
      await this.agendaPeriodService.getLastCandidatePeriod();
    if (!this.agendaPeriodService.validTime(currentPeriod.endTime)) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const currentAgenda = await this.agendaCandidateRepository.findOne({
      where: {
        nominated: true,
        agendaPeriod: {
          id: period.id,
        },
      },
      relations: ['agenda'],
    });

    const agendaVotes = await this.agendaVoteRepository
      .createQueryBuilder('agendaVote')
      .select([
        'COUNT(*) as count',
        'agendaVote.agenda_option_id  AS optionId',
        'agendaVote.id as id',
      ])
      .where('agendaVote.agenda_candidate_id = :id', { id: currentAgenda.id })
      .groupBy('agendaVote.agenda_option_id')
      .getRawMany();

    await this.agendaOptionRepository.update(+agendaVotes[0].optionId, {
      win: true,
    });

    await this.agendaRepository.update(+currentAgenda.agenda.id, {
      complete: true,
    });

    const newPeriod = await this.agendaPeriodService.createPeriod();

    return {
      newPeriod,
      win: agendaVotes[0],
    };
  }
}
