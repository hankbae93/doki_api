import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './entities/agenda.entity';
import { AgendaOption } from './entities/agenda-option.entity';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { StatusCodeEnum } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { AgendaCandidate } from './entities/agenda-candidate.entity';
import { MILLISECONDS_A_DAY } from '../common/constants/time';
import { AgendaPeriodType, AgendaPeriodTypeNum } from './agenda.enum';

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

    return new ResponseDto(StatusCodeEnum.OK, result, EResponseMessage.SUCCESS);
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
      StatusCodeEnum.CREATED,
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
    // find agenda
    // candidate 준비
    // -> 1. period를 먼저 체크한다. 현재 period가 CANDIDATE가 아니면 EXCEPTION
    // -> 2. candidate의 기준은 투표다. 이 안건을 선정 투표하면 생성해야할 게 agenda_candidate
    // -> 3.

    const agenda = await this.agendaRepository.findBy({ id: agendaId });
  }

  async createPeriod() {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + MILLISECONDS_A_DAY);

    let type: AgendaPeriodType;
    let invalidTime = false;
    try {
      const currentPeriod = await this.agendaPeriodRepository.findOne({
        where: {},
        order: { id: 'DESC' },
      });

      invalidTime = startTime.getTime() < currentPeriod.endTime.getTime();

      const typeNum =
        AgendaPeriodTypeNum[currentPeriod.type] + 1 > 2
          ? 0
          : currentPeriod.type + 1;
      type = AgendaPeriodType[typeNum];
    } catch (error) {
      console.error('NOT FOUND PERIOD');
      type = AgendaPeriodType.READY;
    }

    if (invalidTime) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const newPeriod = await this.agendaPeriodRepository.save({
      startTime,
      endTime,
      type,
    });

    return new ResponseDto(
      StatusCodeEnum.CREATED,
      newPeriod,
      EResponseMessage.SUCCESS,
    );
  }
}
