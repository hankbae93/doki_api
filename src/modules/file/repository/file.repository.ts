import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { Anime } from '../../anime/entities/anime.entity';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
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
    }, {}) as FileRepository;

    return manager.getRepository(File).extend(methods);
  }

  async createFiles(
    images: {
      anime: Anime;
      fileName: string;
    }[],
  ) {
    const newImages = this.create(images);

    return this.insert(newImages);
  }
}
