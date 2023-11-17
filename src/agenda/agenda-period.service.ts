import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { Repository } from 'typeorm';
import { MILLISECONDS_A_DAY } from '../common/constants/time';
import { AgendaPeriodType, AgendaPeriodTypeNum } from './agenda.enum';
import { EErrorMessage } from '../common/enum/message.enum';

@Injectable()
export class AgendaPeriodService {
  constructor(
    @InjectRepository(AgendaPeriod)
    private agendaPeriodRepository: Repository<AgendaPeriod>,
  ) {}

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

    return await this.agendaPeriodRepository.save({
      startTime,
      endTime,
      type,
    });
  }
}
