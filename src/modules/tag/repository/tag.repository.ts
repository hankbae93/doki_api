import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagRepository extends Repository<Tag> {
  constructor(private dataSource: DataSource) {
    super(Tag, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager) {
    return manager ? (manager.getRepository(Tag) as TagRepository) : this;
  }

  findAllWithAnimes() {
    return this.find({
      relations: ['animes'],
    });
  }

  findTagsByName(value: string[]) {
    return this.find({
      where: {
        name: In(value),
      },
    });
  }

  createTag(name: string | string[]) {
    const data = Array.isArray(name)
      ? name.map((value) => ({ name: value }))
      : [{ name }];
    const newTag = this.create(data);

    return this.save(newTag);
  }
}
