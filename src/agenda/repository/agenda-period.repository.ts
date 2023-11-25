import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AgendaPeriod } from '../entities/agenda-period.entity';

@Injectable()
export class AgendaPeriodRepository extends Repository<AgendaPeriod> {
  constructor(private dataSource: DataSource) {
    super(AgendaPeriod, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<AgendaPeriod> {
    return manager ? manager.getRepository(AgendaPeriod) : this;
  }

  findPeriodById(periodId: number) {
    return this.findOne({
      where: {
        id: periodId,
      },
    });
  }

  findCurrentPeriod(manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {},
      order: { id: 'DESC' },
    });
  }

  findLatestPeriod(manager?: EntityManager) {
    return this.setManager(manager).find({
      where: {},
      order: { id: 'DESC' },
      take: 2,
    });
  }
}
