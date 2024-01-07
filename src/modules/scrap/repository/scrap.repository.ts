import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Scrap } from '../entities/scrap.entity';
import { User } from '../../user/entities/user.entity';
import { Anime } from '../../anime/entities/anime.entity';

@Injectable()
export class ScrapRepository extends Repository<Scrap> {
  constructor(private dataSource: DataSource) {
    super(Scrap, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Scrap> {
    return manager ? manager.getRepository(Scrap) : this;
  }

  async createScrap(user: User, anime: Anime) {
    const newScrap = this.create({
      user,
      anime,
    });

    await this.insert(newScrap);

    return newScrap;
  }

  getScrapsByUserId(userId: number) {
    return this.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['anime'],
    });
  }

  getScrapsByIds(animeId: number, userId: number, relations?: string[]) {
    return this.findOne({
      where: {
        anime: {
          id: animeId,
        },
        user: {
          id: userId,
        },
      },
      relations,
    });
  }
}
