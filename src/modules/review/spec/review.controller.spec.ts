import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { ReviewController } from '../review.controller';
import { ReviewService } from '../review.service';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

describe('ReviewController', () => {
  let reviewController: ReviewController;
  let reviewService: ReviewService;
  const scenarios = ScenariosMock.getMethodNames(ReviewController);

  const mockReviewService = {
    getMyReviewByAnime: jest.fn(),
    createReviewByAnime: jest.fn(),
    updateMyReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    reviewController = module.get<ReviewController>(ReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(reviewController).toBeDefined();
    expect(reviewService).toBeDefined();
  });

  describe(scenarios.getMyReviewByAnime, () => {
    it('하나의 애니메이션에서 유저가 작성한 리뷰를 반환합니다.', async () => {
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        null,
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(reviewService, 'getMyReviewByAnime')
        .mockResolvedValue(response);
      const result = await reviewService.getMyReviewByAnime(anime.id, user);

      expect(reviewService.getMyReviewByAnime).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.createReviewByAnime, () => {
    it('리뷰 생성을 요청하면 리뷰 정보를 응답합니다.', async () => {
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const review = DataMock.mockReview();
      const dto = {
        content: 'TEST',
        score: 5,
      } as CreateReviewDto;
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        { review, averageScroe: 3 },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(reviewService, 'createReviewByAnime')
        .mockResolvedValue(response);
      const result = await reviewService.createReviewByAnime(
        dto,
        anime.id,
        user,
      );

      expect(reviewService.createReviewByAnime).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.updateMyReview, () => {
    it('리뷰 갱신을 요청하면 갱신된 리뷰 정보를 응답합니다.', async () => {
      const user = DataMock.mockUser();
      const review = DataMock.mockReview();
      const dto = {
        content: 'TEST',
        score: 5,
      } as UpdateReviewDto;
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        Object.assign(review, dto),
        EResponseMessage.UPDATE_SUCCESS,
      );

      jest.spyOn(reviewService, 'updateMyReview').mockResolvedValue(response);
      const result = await reviewService.updateMyReview(dto, review.id, user);

      expect(reviewService.updateMyReview).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });
});
