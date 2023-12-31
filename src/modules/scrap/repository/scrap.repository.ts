import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Scrap } from '../entities/scrap.entity';

@Injectable()
export class ScrapRepository extends Repository<Scrap> {
  constructor(private dataSource: DataSource) {
    super(Scrap, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Scrap> {
    return manager ? manager.getRepository(Scrap) : this;
  }

  getScrapsByIds(animeId: number, userId: number) {
    return this.findOne({
      where: {
        anime: {
          id: animeId,
        },
        user: {
          id: userId,
        },
      },
    });
  }
}
