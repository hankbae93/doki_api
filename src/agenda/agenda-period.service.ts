import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { Repository } from 'typeorm';
import { MILLISECONDS_A_DAY } from '../common/constants/time';
import { AgendaPeriodType } from './agenda.enum';
import { EErrorMessage } from '../common/enum/message.enum';

@Injectable()
export class AgendaPeriodService {
  constructor(
    @InjectRepository(AgendaPeriod)
    private agendaPeriodRepository: Repository<AgendaPeriod>,
  ) {}

  async getCurrentPeriod() {
    return await this.agendaPeriodRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });
  }

  async getLastCandidatePeriod() {
    return await this.agendaPeriodRepository.find({
      where: {},
      order: { id: 'DESC' },
      take: 2,
    });
  }

  async validTime(time: Date) {
    const now = new Date();
    return now.getTime() >= time.getTime();
  }

  async createPeriod() {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + MILLISECONDS_A_DAY);
    const currentPeriod = await this.getCurrentPeriod();

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

    return await this.agendaPeriodRepository.save({
      startTime,
      endTime,
      type: getType(currentPeriod?.type),
    });
  }
}
