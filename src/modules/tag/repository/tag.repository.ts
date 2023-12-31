import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagRepository extends Repository<Tag> {
  constructor(private dataSource: DataSource) {
    super(Tag, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Tag> {
    return manager ? manager.getRepository(Tag) : this;
  }

  findAllWithAnimes() {
    return this.find({
      relations: ['animes'],
    });
  }

  findTagByName(value: string, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {
        name: value,
      },
    });
  }
}
