import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagRepository extends Repository<Tag> {
  constructor(private dataSource: DataSource) {
    super(Tag, dataSource.createEntityManager());
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
    }, {}) as TagRepository;

    return manager.getRepository(Tag).extend(methods);
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
