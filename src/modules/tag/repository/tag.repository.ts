import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
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

  findTagsByName(value: string[], manager?: EntityManager) {
    return this.setManager(manager).find({
      where: {
        name: In(value),
      },
    });
  }

  createTag(name: string | string[], manager?: EntityManager) {
    const data = Array.isArray(name)
      ? name.map((value) => ({ name: value }))
      : [{ name }];
    const newTag = this.setManager(manager).create(data);

    return this.setManager(manager).save(newTag);
  }
}
