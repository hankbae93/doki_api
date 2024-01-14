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

  setManager(manager?: EntityManager) {
    if (!manager) return this;

    const allProperties = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    );

    // 'setManager' 제외하고 필터링
    const methodsToExtend = allProperties.filter((property) => {
      return typeof this[property] === 'function' && property !== 'setManager';
    });

    // extend 메소드에 전달할 객체 생성
    const methods = methodsToExtend.reduce((obj, method) => {
      obj[method] = this[method];
      return obj;
    }, {}) as ScrapRepository;

    return manager.getRepository(Scrap).extend(methods);
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

  getScrapById(scrapId: number, relations?: string[]) {
    return this.findOne({ where: { id: scrapId }, relations });
  }
}
