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
    return manager ? (manager.getRepository(File) as FileRepository) : this;
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
