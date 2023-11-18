import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    private agendaPeriodService: AgendaPeriodService,
  ) {}

  async getAgendaList() {
    const agendaList = await this.agendaRepository.find({
      relations: ['options'],
    });

    const result = agendaList.map((agenda) => ({
      ...agenda,
      options: agenda.options.map((option) => ({
        option_id: option.id,
        content: option.content,
      })),
    }));

    return new ResponseDto(EStatusCode.OK, result, EResponseMessage.SUCCESS);
  }

  async createAgenda(createAgendaDto: CreateAgendaDto, user: User) {
    const { title, options } = createAgendaDto;

    const newAgenda = await this.agendaRepository.save({
      title,
      user,
    });

    const newAgendaOptions = await this.agendaOptionRepository.save(
      options.map((content) => ({
        content,
        agenda: newAgenda,
      })),
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      {
        title: newAgenda.title,
        options: newAgendaOptions.map((option) => ({
          id: option.id,
          content: option.content,
        })),
      },
      EResponseMessage.SUCCESS,
    );
  }

  async candidateAgenda(agendaId: number, user: User) {
    const currentPeriod = await this.agendaPeriodService.getCurrentPeriod();

    if (currentPeriod.type !== AgendaPeriodType.CANDIDATE) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const candidatedAgenda = await this.agendaCandidateRepository.findOneBy({
      agenda: {
        id: agendaId,
      },
    });

    if (candidatedAgenda) {
      const candidateVote = await this.agendaCandidateVoteRepository.findOne({
        where: {
          agendaCandidate: {
            id: candidatedAgenda.id,
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
        agendaCandidate: candidatedAgenda,
        user,
      });

      return new ResponseDto(
        EStatusCode.OK,
        null,
        EResponseMessage.CANDIDATE_SUCCESS,
      );
    }

    if (!candidatedAgenda) {
      const candiAgenda = await this.agendaRepository.findOne({
        where: {
          id: agendaId,
        },
      });

      const newCandidateAgenda = await this.agendaCandidateRepository.save({
        agenda: candiAgenda,
        agendaPeriod: currentPeriod,
        priority: false,
        complete: false,
      });

      await this.agendaCandidateVoteRepository.save({
        user,
        agendaCandidate: newCandidateAgenda,
      });
    } else {
      await this.agendaCandidateVoteRepository.save({
        user,
        agendaCandidate: candidatedAgenda,
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
      where: {
        priority: true,
        agendaPeriod: {
          id: period.id,
        },
      },
      relations: ['agenda'],
    });

    return new ResponseDto(EStatusCode.OK, winners, EResponseMessage.SUCCESS);
  }

  async winAgendaThisWeek() {
    const currentPeriod = await this.agendaPeriodService.getCurrentPeriod();

    if (!currentPeriod) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const data = await this.agendaCandidateRepository
      .createQueryBuilder('agenda_candidate')
      .leftJoin('agenda_candidate.agendaCandidateVotes', 'vote')
      .select('agenda_candidate.*, COUNT(vote.id) as voteCount')
      .groupBy('agenda_candidate.id')
      .having('voteCount > 0')
      .orderBy('voteCount', 'DESC')
      .limit(3)
      .getRawMany();

    const candidates = data.map((record) => {
      return {
        ...record,
        voteCount: +record.voteCount,
      } as AgendaCandidate;
    });

    const winner = candidates[0];

    if (winner) {
      const nextPeriod = await this.agendaPeriodService.createPeriod();
      await this.agendaCandidateRepository.update(+winner.id, {
        agendaPeriod: nextPeriod,
      });

      candidates.map(async (agenda, index) => {
        if (index !== 0) {
          await this.agendaCandidateRepository.update(+agenda.id, {
            priority: true,
          });
        }
      });
    }

    return new ResponseDto(
      EStatusCode.OK,
      candidates,
      EResponseMessage.SUCCESS,
    );
  }

  async getAgendaForVote() {
    const currentPeriod = await this.agendaPeriodService.getCurrentPeriod();

    const data = await this.agendaCandidateRepository
      .createQueryBuilder('agenda_candidate')
      .leftJoinAndSelect(
        Agenda,
        'agenda',
        'agenda.id = agenda_candidate.agenda_id',
      )
      .leftJoinAndSelect(
        AgendaOption,
        'agenda_option',
        'agenda_option.agenda_id = agenda.id',
      )
      .select(
        'agenda_option.id as optionId, agenda_option.content as optionContent, agenda.title as title, agenda.id as agendaId',
      )
      .where('agenda_candidate.agenda_period_id = :periodId', {
        periodId: currentPeriod.id,
      })
      .getRawMany();

    if (!data) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return {
      period: currentPeriod,
      agenda: {
        id: data[0].agendaId,
        title: data[0].title,
        options: data.map((item) => ({
          optionId: item.optionId,
          content: item.optionContent,
        })),
      },
    };
  }
}
