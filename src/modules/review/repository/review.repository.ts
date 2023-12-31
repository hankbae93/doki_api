import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Review> {
    return manager ? manager.getRepository(Review) : this;
  }

  getReviewsByIds(animeId: number, userId: number) {
    return this.findOne({
      where: {
        anime: {
          id: animeId,
        },
        user: {
          id: userId,
        },
      },
    });
  }
}
