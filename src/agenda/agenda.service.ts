import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { MILLISECONDS_A_DAY } from '../common/constants/time';
import { AgendaPeriodType, AgendaPeriodTypeNum } from './agenda.enum';
import { AgendaCandidateVote } from './entities/agenda-canidate-vote.entity';

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
    const currentPeriod = await this.agendaPeriodRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    if (currentPeriod.type !== AgendaPeriodType.CANDIDATE) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const candidatedAgenda = await this.agendaCandidateRepository.findOneBy({
      agenda: {
        id: agendaId,
      },
    });

    const isCandidateAndVote = await this.agendaCandidateVoteRepository.findOne(
      {
        where: {
          agendaCandidate: {
            id: candidatedAgenda.id,
          },
          user: {
            id: user.id,
          },
        },
      },
    );

    if (isCandidateAndVote) {
      await this.agendaCandidateVoteRepository.remove(isCandidateAndVote);

      return new ResponseDto(EStatusCode.OK, null, EResponseMessage.CANCEL);
    }

    if (!candidatedAgenda) {
      const candiAgenda = await this.agendaRepository.findOne({
        where: {
          id: agendaId,
        },
      });

      const newCandidateAgenda = await this.agendaCandidateRepository.save({
        agenda: candiAgenda,
        title: candiAgenda.title,
        agendaPeriod: currentPeriod,
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

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.SUCCESS);
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
      const currentPeriodNum = AgendaPeriodTypeNum[currentPeriod.type];
      const typeNum =
        currentPeriodNum + 1 <= 2
          ? AgendaPeriodTypeNum[currentPeriod.type] + 1
          : 0;
      type = AgendaPeriodTypeNum[typeNum] as AgendaPeriodType;
    } catch (error) {
      console.error('NOT FOUND PERIOD');
      type = AgendaPeriodType.READY;
    }

    if (invalidTime) {
      throw new ForbiddenException(EErrorMessage.NOT_CREATE_PERIOD);
    }

    const newPeriod = await this.agendaPeriodRepository.save({
      startTime,
      endTime,
      type,
    });

    return new ResponseDto(
      EStatusCode.CREATED,
      newPeriod,
      EResponseMessage.SUCCESS,
    );
  }
}
