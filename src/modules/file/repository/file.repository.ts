import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { Anime } from '../../anime/entities/anime.entity';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<File> {
    return manager ? manager.getRepository(File) : this;
  }

  async createFiles(
    images: {
      anime: Anime;
      fileName: string;
    }[],
    manager?: EntityManager,
  ) {
    const newImages = this.setManager(manager).create(images);

    return this.setManager(manager).insert(newImages);
  }
}
