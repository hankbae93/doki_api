import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AgendaPeriod } from '../entities/agenda-period.entity';

@Injectable()
export class AgendaPeriodRepository extends Repository<AgendaPeriod> {
  constructor(private dataSource: DataSource) {
    super(AgendaPeriod, dataSource.createEntityManager());
  }

  findCurrentPeriod() {
    return this.findOne({
      where: {},
      order: { id: 'DESC' },
    });
  }
}
