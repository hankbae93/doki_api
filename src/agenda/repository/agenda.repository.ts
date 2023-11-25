import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Agenda } from '../entities/agenda.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AgendaRepository extends Repository<Agenda> {
  constructor(private dataSource: DataSource) {
    super(Agenda, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Agenda> {
    return manager ? manager.getRepository(Agenda) : this;
  }

  findAgendaById(agendaId: number) {
    return this.findOne({
      where: {
        id: agendaId,
      },
    });
  }

  findAgendaList(manager?: EntityManager) {
    return this.setManager(manager).find({
      select: {
        id: true,
        title: true,
        complete: false,
        agendaOptions: {
          id: true,
          content: true,
          win: false,
        },
      },
      where: {
        complete: false,
      },
      relations: ['agendaOptions'],
    });
  }

  updateComplete(id: number, manager?: EntityManager) {
    return this.setManager(manager).update(id, {
      complete: true,
    });
  }

  saveRecord(
    title: string,
    user: User,
    manager?: EntityManager,
  ): Promise<Agenda> {
    return this.setManager(manager).save({
      title,
      user,
      complete: false,
    });
  }
}
