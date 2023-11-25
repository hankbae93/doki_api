import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Agenda } from './entities/agenda.entity';
import { DataSource, Repository } from 'typeorm';
import { AgendaOption } from './entities/agenda-option.entity';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { AgendaCandidate } from './entities/agenda-candidate.entity';
import { AgendaCandidateVote } from './entities/agenda-canidate-vote.entity';
import { AgendaVote } from './entities/agenda-vote.entity';
import { MILLISECONDS_A_MINUTE } from '../common/constants/time';
import { AgendaPeriodType } from './agenda.enum';

@Injectable()
export class AgendaSchedulerService {
  private readonly logger = new Logger(AgendaSchedulerService.name);

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
  ) {}

  @Cron(CronExpression.EVERY_8_HOURS)
  async schedulePeriod() {
    this.logger.debug('SCHEDULE PERIOD');
    const currentPeriod = await this.agendaPeriodRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + MILLISECONDS_A_MINUTE * 5);
    if (
      currentPeriod &&
      startTime.getTime() < currentPeriod.endTime.getTime()
    ) {
      return this.logger.log("can't create period, it's not time yet");
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

    await this.agendaPeriodRepository.insert({
      startTime,
      endTime,
      type: getType(currentPeriod?.type),
    });
    this.logger.log(`CREATED PERIOD [${getType(currentPeriod?.type)}]`);
  }
}
