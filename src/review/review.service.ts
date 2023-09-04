import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { DataSource, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { StatusCodeEnum } from '../common/enum/status.enum';
import { ResponseMessageEnum } from '../common/enum/message.enum';
import { ReviewCountByUserRank, UserRank } from '../user/user.enum';
import { getIsNextRank } from './review.util';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    private dataSource: DataSource,
  ) {}

  async createReviewByAnime(
    createReviewDto: CreateReviewDto,
    animeId: number,
    user: User,
  ) {
    const { content, score } = createReviewDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const animeRepository = this.dataSource.manager.getRepository(Anime);
    const reviewRepository = this.dataSource.manager.getRepository(Review);
    const userRepository = this.dataSource.manager.getRepository(User);

    try {
      const anime = await animeRepository.findOne({
        where: { id: animeId },
        relations: ['reviews'],
      });

      const review = await reviewRepository.findOne({
        where: {
          anime: { id: animeId },
          user: { id: user.id },
        },
      });

      if (review) return new ForbiddenException('이미 생성된 리뷰가 있습니다.');

      const newReview = await reviewRepository.create({
        content,
        score,
        anime,
        user,
        img: '',
      });

      const scoreSum =
        anime.reviews.reduce((acc, cur) => acc + cur.score, 0) + score;
      const reviewCount =
        anime.reviews.length === 0 ? 1 : anime.reviews.length + 1;
      const averageScore = Math.floor(scoreSum / reviewCount);

      await reviewRepository.insert(newReview);

      await animeRepository.update(
        { id: animeId },
        {
          averageScore,
        },
      );

      const userReviews = await reviewRepository.find({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      //
      const { nextRank, rank } = getIsNextRank(
        userReviews.length,
        UserRank[user.rank],
      );

      if (nextRank !== rank) {
        await userRepository.save({
          ...user,
          rank: UserRank[nextRank],
        });
      }

      await queryRunner.commitTransaction();
      return new ResponseDto(
        StatusCodeEnum.CREATED,
        { review: newReview, averageScore },
        ResponseMessageEnum.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getMyReviewByAnime(animeId: number, user: User) {
    const review = await this.reviewRepository.findOne({
      where: {
        anime: { id: animeId },
        user: { id: user.id },
      },
    });

    return new ResponseDto(
      StatusCodeEnum.OK,
      review,
      ResponseMessageEnum.SUCCESS,
    );
  }

  async updateMyReview(
    updateReviewDto: UpdateReviewDto,
    id: number,
    user: User,
  ) {
    const review = await this.reviewRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!review) return new NotFoundException('존재하지 않는 리뷰입니다.');
    if (review.user.id !== user.id)
      return new ForbiddenException('리뷰를 등록한 사용자가 아닙니다.');

    await this.reviewRepository.update(
      { id },
      {
        ...updateReviewDto,
      },
    );

    return new ResponseDto(
      StatusCodeEnum.OK,
      {
        ...review,
        ...updateReviewDto,
      },
      ResponseMessageEnum.UPDATE_SUCCESS,
    );
  }
}
