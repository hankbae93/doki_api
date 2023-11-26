import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AgendaPeriodRepository } from './repository/agenda-period.repository';
import { AgendaService } from './agenda.service';

@Injectable()
export class AgendaSchedulerService {
  private readonly logger = new Logger(AgendaSchedulerService.name);

  constructor(
    private readonly agendaPeriodRepository: AgendaPeriodRepository,
    private agendaService: AgendaService,
  ) {}

  // @Cron('*/30 * * * * *')
  // async schedulePeriod() {
  //   this.logger.log('SCHEDULE START');
  //   try {
  //     const period = await this.agendaPeriodRepository.findCurrentPeriod();
  //     const isValidTime = validTime(period.endTime);
  //     if (!isValidTime) {
  //       throw new Error(EErrorMessage.NOT_TIME_YET);
  //     }
  //
  //     if (period.type === AgendaPeriodType.READY) {
  //       await this.scheduleReady();
  //     } else if (period.type === AgendaPeriodType.CANDIDATE) {
  //       await this.scheduleNominate();
  //     } else if (period.type === AgendaPeriodType.VOTE) {
  //       await this.scheduleVote();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     this.logger.log('SCHEDULE END');
  //   }
  // }

  // 월요일 00:00:00 호출
  @Cron('0 0 * * 1')
  async scheduleReady() {
    this.logger.log('READY START');
    const { data: period } = await this.agendaService.createPeriod();
    console.log(`${period.type} : ${period.startTime} ~ ${period.endTime}`);
    this.logger.log('READY END');
  }

  // 화요일 00:00:00 호출
  @Cron('0 0 * * 2')
  async scheduleNominate() {
    this.logger.log('NOMINATED START');
    const data = await this.agendaService.nominateAgenda();
    const { data: period } = await this.agendaService.createPeriod();
    console.log(`${period.type} : ${period.startTime} ~ ${period.endTime}`);
    this.logger.log('NOMINATED END', data);
  }

  // 수요일 00:00:00 호출
  @Cron('0 0 * * 3')
  async scheduleVote() {
    this.logger.log('VOTE START');
    // 정산이 됐는지 확인해야함
    const period = await this.agendaPeriodRepository.findCurrentPeriod();
    const winner = await this.agendaService.getWinnerAgendaListByPeriod(
      period.id,
    );
    if (winner) {
      throw new Error('Complete vote settlement');
    }
    const data = await this.agendaService.winAgendaVoteThisWeek();
    this.logger.log('VOTE END', data);
  }
}
