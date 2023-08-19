import { ForbiddenException, Injectable } from '@nestjs/common';
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

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    private dataSource: DataSource,
  ) {}

  async createReview(
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
      const reviewCount = anime.reviews.length === 0 ? 1 : anime.reviews.length;
      const averageScore = Math.floor(scoreSum ? scoreSum / reviewCount : 0);

      await reviewRepository.insert(newReview);

      await animeRepository.update(
        { id: animeId },
        {
          averageScore,
        },
      );

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

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
