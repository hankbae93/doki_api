import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../common/enum/message.enum';
import { UserRank } from '../user/user.enum';
import { getIsNextRank } from './review.util';
import { ReviewRepository } from './repository/review.repository';
import { AnimeRepository } from '../anime/repository/anime.repository';
import { TransactionHelper } from '../../common/helper/transaction.helper';
import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private animeRepository: AnimeRepository,
    private userRepository: UserRepository,
    private dataSource: DataSource,
  ) {}

  async getMyReviewByAnime(animeId: number, user: User) {
    const review = await this.reviewRepository.getReviewsByIds(
      animeId,
      user.id,
    );

    return new ResponseDto(EStatusCode.OK, review, EResponseMessage.SUCCESS);
  }

  async updateAnimeAverageScore(
    animeId: number,
    score: number,
    entityManager?: EntityManager,
  ) {
    const anime = await this.animeRepository.getAnimeWithReviews(
      animeId,
      entityManager,
    );

    const scoreSum =
      anime.reviews.reduce((acc, cur) => acc + cur.score, 0) + score;
    const reviewCount =
      anime.reviews.length === 0 ? 1 : anime.reviews.length + 1;
    const averageScore = Math.floor(scoreSum / reviewCount);

    return await this.animeRepository
      .setManager(entityManager)
      .save(Object.assign(anime, { averageScore }));
  }

  async createReviewByAnime(
    createReviewDto: CreateReviewDto,
    animeId: number,
    user: User,
  ) {
    const { content, score } = createReviewDto;

    const result = await TransactionHelper.transaction(
      this.dataSource,
      async (entityManager) => {
        const review = await this.reviewRepository.getReviewsByIds(
          animeId,
          user.id,
          entityManager,
        );

        if (review) {
          throw new ForbiddenException(EErrorMessage.EXISITEING_REVIEW);
        }

        const anime = await this.animeRepository.getAnimeWithReviews(
          animeId,
          entityManager,
        );

        const newReview = await this.reviewRepository.createReview({
          content,
          score,
          anime,
          user,
        });

        const scoreSum =
          anime.reviews.reduce((acc, cur) => acc + cur.score, 0) + score;
        const reviewCount =
          anime.reviews.length === 0 ? 1 : anime.reviews.length + 1;
        const averageScore = Math.floor(scoreSum / reviewCount);

        await this.animeRepository.update(animeId, {
          averageScore,
        });

        const userReviews = await this.reviewRepository.getReviewsByUserId(
          user.id,
          entityManager,
        );

        const userReviewCount = userReviews.length + 1;
        const { nextRank, rank } = getIsNextRank(
          userReviewCount,
          UserRank[user.rank],
        );

        if (nextRank !== rank) {
          await this.userRepository.updateUserRank(
            user.id,
            UserRank[nextRank],
            entityManager,
          );
        }

        return { review: newReview, averageScore };
      },
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      result,
      EResponseMessage.SUCCESS,
    );
  }

  async updateMyReview(
    updateReviewDto: UpdateReviewDto,
    reviewId: number,
    user: User,
  ) {
    const result = await TransactionHelper.transaction(
      this.dataSource,
      async (entityManager) => {
        const { animeId, ...dto } = updateReviewDto;

        const review = await this.reviewRepository.findReviewWithUserById(
          reviewId,
          entityManager,
        );

        if (!review) {
          throw new NotFoundException(EErrorMessage.NOT_FOUND);
        }
        if (review.user.id !== user.id) {
          throw new ForbiddenException(EErrorMessage.NOT_PERMISSIONS);
        }

        const updatedReview = await this.reviewRepository.updateReview(
          Object.assign(review, dto),
          entityManager,
        );

        if (updateReviewDto.score && animeId) {
          const anime = await this.animeRepository.getAnimeWithReviews(
            animeId,
            entityManager,
          );

          const scoreSum =
            anime.reviews.reduce((acc, cur) => acc + cur.score, 0) +
            updateReviewDto.score;
          const reviewCount =
            anime.reviews.length === 0 ? 1 : anime.reviews.length + 1;
          const averageScore = Math.floor(scoreSum / reviewCount);
          await this.animeRepository.update(animeId, {
            averageScore,
          });
        }

        return updatedReview;
      },
    );

    return new ResponseDto(
      EStatusCode.OK,
      result,
      EResponseMessage.UPDATE_SUCCESS,
    );
  }
}
