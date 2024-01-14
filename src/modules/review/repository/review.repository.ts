import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
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
    }, {}) as ReviewRepository;

    return manager.getRepository(Review).extend(methods);
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
