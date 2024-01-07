import { Test, TestingModule } from '@nestjs/testing';

import { ScrapRepository } from '../../scrap/repository/scrap.repository';
import { ScrapService } from '../scrap.service';
import { AnimeRepository } from '../../anime/repository/anime.repository';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('scrapService', () => {
  let scrapService: ScrapService;
  let animeRepository: AnimeRepository;
  let scrapRepository: ScrapRepository;
  // let scenarios: Record<keyof ScrapService, keyof ScrapService> = {};
  const scenarios = ScenariosMock.getMethodNames(ScrapService);

  const mockAnimeRepository = {
    findAnimeWithUserById: jest.fn(),
  };
  const mockScrapRepository = {
    getScrapsByIds: jest.fn(),
    getScrapById: jest.fn(),
    getScrapsByUserId: jest.fn(),
    remove: jest.fn(),
    createScrap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapService,
        { provide: AnimeRepository, useValue: mockAnimeRepository },
        { provide: ScrapRepository, useValue: mockScrapRepository },
      ],
    }).compile();

    scrapService = module.get<ScrapService>(ScrapService);
    animeRepository = module.get<AnimeRepository>(AnimeRepository);
    scrapRepository = module.get<ScrapRepository>(ScrapRepository);
  });

  describe(scenarios.getMyScraps, () => {
    it('유저가 스크랩한 애니메이션 목록을 반환해야 합니다.', async () => {
      const user = DataMock.mockUser();
      const scrap = DataMock.mockScrap();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        [scrap],
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(scrapRepository, 'getScrapsByUserId')
        .mockResolvedValue([scrap]);

      const result = await scrapService.getMyScraps(user);

      expect(scrapRepository.getScrapsByUserId).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.scrapAnime, () => {
    it('스크랩이 성공하면 스크랩 정보를 반환해야 합니다.', async () => {
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const scrap = DataMock.mockScrap();
      const response = DataMock.mockResponse(
        EStatusCode.CREATED,
        scrap,
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'findAnimeWithUserById')
        .mockResolvedValue(anime);
      jest.spyOn(scrapRepository, 'getScrapsByIds').mockResolvedValue(null);
      jest.spyOn(scrapRepository, 'createScrap').mockResolvedValue(scrap);

      const result = await scrapService.scrapAnime(anime.id, user);

      expect(animeRepository.findAnimeWithUserById).toHaveBeenCalledWith(
        anime.id,
      );
      expect(scrapRepository.getScrapsByIds).toHaveBeenCalledWith(
        anime.id,
        user.id,
      );
      expect(scrapRepository.createScrap).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('스크랩이 존재하면 에러를 반환해야 합니다.', async () => {
      const anime = DataMock.mockAnime();
      const user = DataMock.mockUser();
      const scrap = DataMock.mockScrap();

      jest
        .spyOn(animeRepository, 'findAnimeWithUserById')
        .mockResolvedValue(anime);
      jest.spyOn(scrapRepository, 'getScrapsByIds').mockResolvedValue(scrap);

      await expect(
        scrapService.scrapAnime(anime.id, user),
      ).rejects.toThrowError(ForbiddenException);
    });
  });

  describe(scenarios.removeScrapedAnime, () => {
    it('스크랩 취소를 하면 응답을 반환해야 합니다.', async () => {
      const scrap = DataMock.mockScrap();
      const user = DataMock.mockUser();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        null,
        EResponseMessage.DELETE_ITEM,
      );

      jest.spyOn(scrapRepository, 'getScrapById').mockResolvedValue(scrap);

      const result = await scrapService.removeScrapedAnime(scrap.id, user);

      expect(result).toEqual(response);
    });

    it('스크랩이 존재하지 않으면 에러를 반환해야 합니다.', async () => {
      const scrap = DataMock.mockScrap();
      const user = DataMock.mockUser();

      jest.spyOn(scrapRepository, 'getScrapById').mockResolvedValue(null);

      await expect(
        scrapService.removeScrapedAnime(scrap.id, user),
      ).rejects.toThrowError(NotFoundException);
    });

    it('스크랩을 한 유저가 아니면 에러를 반환해야 합니다.', async () => {
      const scrap = DataMock.mockScrap();
      const user = DataMock.mockUser();

      jest
        .spyOn(scrapRepository, 'getScrapById')
        .mockResolvedValue(Object.assign(scrap, { user: { ...user, id: 2 } }));

      await expect(
        scrapService.removeScrapedAnime(scrap.id, user),
      ).rejects.toThrowError(ForbiddenException);
    });
  });
});
