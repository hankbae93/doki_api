import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

@Injectable()
export class ImageRepository extends Repository<Image> {
  constructor(private dataSource: DataSource) {
    super(Image, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Image> {
    return manager ? manager.getRepository(Image) : this;
  }
}
