import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<Review> {
    return manager ? manager.getRepository(Review) : this;
  }

  async createReview(review: DeepPartial<Review>, manager?: EntityManager) {
    const newReview = this.setManager(manager).create(review);
    await this.insert(newReview);

    return newReview;
  }

  async updateReview(review: Review, manager?: EntityManager) {
    return this.setManager(manager).save(review);
  }

  findReviewWithUserById(reviewId: number, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {
        id: reviewId,
      },
      relations: ['user'],
    });
  }

  getReviewsByIds(animeId: number, userId: number, manager?: EntityManager) {
    return this.setManager(manager).findOne({
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

  getReviewsByUserId(userId: number, manager?: EntityManager) {
    return this.setManager(manager).find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  deleteReviews(reviewIds: number[], manager?: EntityManager) {
    return this.setManager(manager).update(reviewIds, { deleted: true });
  }
}
