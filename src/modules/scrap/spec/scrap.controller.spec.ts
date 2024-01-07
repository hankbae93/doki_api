import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { ScrapController } from '../scrap.controller';
import { ScrapService } from '../scrap.service';
import { DataMock } from '../../../common/mock/data.mock';
import { ResponseDto } from '../../../common/dto/response.dto';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';

describe('ScrapController', () => {
  let scrapController: ScrapController;
  let scrapService: ScrapService;

  const mockScrapService = {
    getMyScraps: jest.fn(),
    scrapAnime: jest.fn(),
    removeScrapedAnime: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapController],
      providers: [
        {
          provide: ScrapService,
          useValue: mockScrapService,
        },
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    scrapController = module.get<ScrapController>(ScrapController);
    scrapService = module.get<ScrapService>(ScrapService);
  });

  it('should be defined', () => {
    expect(scrapController).toBeDefined();
    expect(scrapService).toBeDefined();
  });

  describe('getMyScraps', () => {
    it('유저가 스크랩한 애니메이션 목록을 반환해야 합니다.', async () => {
      const user = DataMock.mockUser();
      const scrap = DataMock.mockScrap();
      const response = new ResponseDto(
        EStatusCode.OK,
        [scrap],
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(scrapService, 'getMyScraps').mockResolvedValue(response);

      const result = await scrapController.getMyScraps(user);

      expect(scrapService.getMyScraps).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('scrapAnime', () => {
    it('스크랩을 요청하면 스크랩 정보를 반환해야 합니다.', async () => {
      const user = DataMock.mockUser();
      const anime = DataMock.mockAnime();
      const scrap = DataMock.mockScrap();
      const response = new ResponseDto(
        EStatusCode.CREATED,
        scrap,
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(scrapService, 'scrapAnime').mockResolvedValue(response);

      const result = await scrapController.scrapAnime(anime.id, user);

      expect(scrapService.scrapAnime).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('removeScrapedAnime', () => {
    it('스크랩 취소를 요청하면 응답을 반환해야 합니다.', async () => {
      const user = DataMock.mockUser();
      const scrapId = DataMock.mockScrap().id;
      const response = new ResponseDto(
        EStatusCode.OK,
        null,
        EResponseMessage.DELETE_ITEM,
      );

      jest
        .spyOn(scrapService, 'removeScrapedAnime')
        .mockResolvedValue(response);

      const result = await scrapController.removeScrapedAnime(scrapId, user);

      expect(scrapService.removeScrapedAnime).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });
});
