import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DataSource } from 'typeorm';
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

        const { nextRank, rank } = getIsNextRank(
          userReviews.length,
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
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['user'],
    });

    if (!review) return new NotFoundException('존재하지 않는 리뷰입니다.');
    if (review.user.id !== user.id)
      return new ForbiddenException('리뷰를 등록한 사용자가 아닙니다.');

    await this.reviewRepository.update(
      { id: reviewId },
      {
        ...updateReviewDto,
      },
    );

    return new ResponseDto(
      EStatusCode.OK,
      {
        ...review,
        ...updateReviewDto,
      },
      EResponseMessage.UPDATE_SUCCESS,
    );
  }
}
