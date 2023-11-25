import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AgendaOption } from '../entities/agenda-option.entity';
import { Agenda } from '../entities/agenda.entity';

@Injectable()
export class AgendaOptionRepository extends Repository<AgendaOption> {
  constructor(private dataSource: DataSource) {
    super(AgendaOption, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<AgendaOption> {
    return manager.getRepository(AgendaOption) || this;
  }

  saveRecords(
    options: string[],
    agenda: Agenda,
    manager?: EntityManager,
  ): Promise<AgendaOption[]> {
    return this.setManager(manager).save(
      options.map((content) => ({
        content,
        win: false,
        agenda,
      })),
    );
  }
}
