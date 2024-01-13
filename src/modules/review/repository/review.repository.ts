import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager) {
    return manager ? (manager.getRepository(Review) as ReviewRepository) : this;
  }

  async createReview(review: DeepPartial<Review>) {
    const newReview = this.create(review);
    await this.insert(newReview);

    return newReview;
  }

  async updateReview(review: Review) {
    return this.save(review);
  }

  findReviewWithUserById(reviewId: number) {
    return this.findOne({
      where: {
        id: reviewId,
      },
      relations: ['user'],
    });
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

  getReviewsByUserId(userId: number) {
    return this.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  deleteReviews(reviewIds: number[]) {
    return this.update(reviewIds, { deleted: true });
  }
}
