import { Test, TestingModule } from '@nestjs/testing';
import { AnimeRepository } from '../../anime/repository/anime.repository';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { ReviewService } from '../review.service';
import { ReviewRepository } from '../repository/review.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { DataSource } from 'typeorm';
import { ConnectionMock } from '../../../common/mock/connection.mock';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateReviewDto } from '../dto/update-review.dto';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let reviewRepository: ReviewRepository;
  let animeRepository: AnimeRepository;
  let userRepository: UserRepository;
  let dataSource: DataSource;
  const scenarios = ScenariosMock.getMethodNames(ReviewService);

  const mockReviewRepository = {
    getReviewsByIds: jest.fn(),
    createReview: jest.fn(),
    getReviewsByUserId: jest.fn(),
    update: jest.fn(),
    findReviewWithUserById: jest.fn(),
  };

  const mockAnimeRepository = {
    getAnimeWithReviews: jest.fn(),
    findAnimeById: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    updateUserRank: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: ReviewRepository, useValue: mockReviewRepository },
        { provide: AnimeRepository, useValue: mockAnimeRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: DataSource,
          useClass: ConnectionMock,
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    animeRepository = module.get<AnimeRepository>(AnimeRepository);
    reviewRepository = module.get<ReviewRepository>(ReviewRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe(scenarios.getMyReviewByAnime, () => {
    it('하나의 애니메이션에서 유저가 작성한 리뷰를 반환합니다. ', async () => {
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const review = DataMock.mockReview();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        review,
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(reviewRepository, 'getReviewsByIds').mockResolvedValue(review);

      const result = await reviewService.getMyReviewByAnime(anime.id, user);
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.createReviewByAnime, () => {
    it('리뷰 생성이 성공하면 애니메이션 평점을 업데이트하고 리뷰 정보를 반환합니다.', async () => {
      const review = DataMock.mockReview();
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const dto = {
        content: review.content,
        score: review.score,
      } as CreateReviewDto;
      const response = DataMock.mockResponse(
        EStatusCode.CREATED,
        { review, averageScore: review.score },
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(reviewRepository, 'getReviewsByIds').mockResolvedValue(null);
      jest
        .spyOn(animeRepository, 'getAnimeWithReviews')
        .mockResolvedValue(
          Object.assign(anime, { reviews: [{ ...review, id: 2 }] }),
        );
      jest.spyOn(reviewRepository, 'createReview').mockResolvedValue(review);
      jest.spyOn(reviewRepository, 'getReviewsByUserId').mockResolvedValue([]);

      const result = await reviewService.createReviewByAnime(
        dto,
        anime.id,
        user,
      );

      expect(animeRepository.update).toHaveBeenCalledWith(anime.id, {
        averageScore: review.score,
      });
      expect(result).toEqual(response);
    });

    it('리뷰를 생성한 이후 유저 리뷰 수가 일정 기준을 넘기면 유저 랭크를 업데이트하고 리뷰 정보를 반환합니다.', async () => {
      const review = DataMock.mockReview();
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const dto = {
        content: review.content,
        score: review.score,
      } as CreateReviewDto;
      const response = DataMock.mockResponse(
        EStatusCode.CREATED,
        { review, averageScore: review.score },
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(reviewRepository, 'getReviewsByIds').mockResolvedValue(null);
      jest
        .spyOn(animeRepository, 'getAnimeWithReviews')
        .mockResolvedValue(
          Object.assign(anime, { reviews: [{ ...review, id: 2 }] }),
        );
      jest.spyOn(reviewRepository, 'createReview').mockResolvedValue(review);
      jest
        .spyOn(reviewRepository, 'getReviewsByUserId')
        .mockResolvedValue(Array(5).fill(review));

      const result = await reviewService.createReviewByAnime(
        dto,
        anime.id,
        user,
      );

      expect(userRepository.updateUserRank).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('유저가 작성한 리뷰가 존재하면 에러를 던집니다.', async () => {
      const review = DataMock.mockReview();
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const dto = {
        content: review.content,
        score: review.score,
      } as CreateReviewDto;

      jest.spyOn(reviewRepository, 'getReviewsByIds').mockResolvedValue(review);

      await expect(
        reviewService.createReviewByAnime(dto, anime.id, user),
      ).rejects.toThrowError(ForbiddenException);
    });
  });

  describe(scenarios.updateMyReview, () => {
    it('리뷰 갱신이 성공하면 업데이트된 리뷰 정보를 반환합니다.', async () => {
      const review = DataMock.mockReview();
      const user = DataMock.mockUser();
      const dto = {
        content: 'TEST_REVIEW',
      } as UpdateReviewDto;
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        Object.assign(review, dto),
        EResponseMessage.UPDATE_SUCCESS,
      );

      jest
        .spyOn(reviewRepository, 'findReviewWithUserById')
        .mockResolvedValue(review);

      const result = await reviewService.updateMyReview(dto, review.id, user);

      expect(reviewRepository.findReviewWithUserById).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('리뷰가 존재하지 않으면 에러를 던집니다.', async () => {
      const review = DataMock.mockReview();
      const user = DataMock.mockUser();
      const dto = {
        content: 'TEST_REVIEW',
      } as UpdateReviewDto;

      jest
        .spyOn(reviewRepository, 'findReviewWithUserById')
        .mockResolvedValue(null);

      await expect(
        reviewService.updateMyReview(dto, review.id, user),
      ).rejects.toThrowError(NotFoundException);
    });

    it('리뷰를 생성한 유저가 아니면 에러를 던집니다.', async () => {
      const review = DataMock.mockReview();
      const user = Object.assign(DataMock.mockUser(), { id: 12 });
      const dto = {
        content: 'TEST_REVIEW',
      } as UpdateReviewDto;

      jest
        .spyOn(reviewRepository, 'findReviewWithUserById')
        .mockResolvedValue(review);

      await expect(
        reviewService.updateMyReview(dto, review.id, user),
      ).rejects.toThrowError(ForbiddenException);
    });

    it('리뷰 점수가 갱신이 되면 애니메이션 평점을 업데이트하고 리뷰 정보를 반환합니다.', async () => {});
  });
});
