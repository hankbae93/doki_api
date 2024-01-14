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
import { TransactionHandler } from '../../common/handler/transaction.handler';
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
    const anime = await this.animeRepository.getAnimeWithReviews(animeId);

    const scoreSum =
      anime.reviews.reduce((acc, cur) => acc + cur.score, 0) + score;
    const reviewCount =
      anime.reviews.length === 0 ? 1 : anime.reviews.length + 1;
    const averageScore = Math.floor(scoreSum / reviewCount);

    return await this.animeRepository.saveAnime(
      Object.assign(anime, { averageScore }),
    );
  }

  async createReviewByAnime(
    createReviewDto: CreateReviewDto,
    animeId: number,
    user: User,
  ) {
    const { content, score } = createReviewDto;

    const result = await TransactionHandler.transaction(
      this.dataSource,
      async (entityManager) => {
        const reviewRepository = await this.reviewRepository.setManager(
          entityManager,
        );
        const userRepository = await this.userRepository.setManager(
          entityManager,
        );

        const review = await reviewRepository.getReviewsByIds(animeId, user.id);

        if (review) {
          throw new ForbiddenException(EErrorMessage.EXISITEING_REVIEW);
        }

        const anime = await this.updateAnimeAverageScore(animeId, score);

        const newReview = await reviewRepository.createReview({
          content,
          score,
          anime,
          user,
        });

        const userReviews = await reviewRepository.getReviewsByUserId(user.id);

        const userReviewCount = userReviews.length + 1;
        const { nextRank, rank } = getIsNextRank(
          userReviewCount,
          UserRank[user.rank],
        );

        if (nextRank !== rank) {
          await userRepository.updateUserRank(user.id, UserRank[nextRank]);
        }

        return newReview;
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
    const result = await TransactionHandler.transaction(
      this.dataSource,
      async (entityManager) => {
        const { animeId, ...dto } = updateReviewDto;

        const reviewRepository =
          this.reviewRepository.setManager(entityManager);

        const review = await reviewRepository.findReviewWithUserById(reviewId);

        if (!review) {
          throw new NotFoundException(EErrorMessage.NOT_FOUND);
        }

        if (review.user.id !== user.id) {
          throw new ForbiddenException(EErrorMessage.NOT_PERMISSIONS);
        }

        const updatedReview = await reviewRepository.updateReview(
          Object.assign(review, dto),
        );

        if (updateReviewDto.score && animeId) {
          await this.updateAnimeAverageScore(animeId, updateReviewDto.score);
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
