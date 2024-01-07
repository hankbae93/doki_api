import { Test, TestingModule } from '@nestjs/testing';

import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';
import { AnimeController } from '../anime.controller';
import { AnimeService } from '../anime.service';
import { DataMock } from '../../../common/mock/data.mock';
import { AnimeRepository } from '../repository/anime.repository';
import { FileRepository } from '../../file/repository/file.repository';
import { ScrapRepository } from '../../scrap/repository/scrap.repository';
import { TagRepository } from '../../tag/repository/tag.repository';
import { ReviewRepository } from '../../review/repository/review.repository';
import { UserRank } from '../../user/user.enum';
import { User } from '../../user/entities/user.entity';
import { Anime } from '../entities/anime.entity';
import { PassportModule } from '@nestjs/passport';
import { GetAllAnimeQueryDto } from '../dto/get-all-anime-query.dto';
import { AnimeSource } from '../anime.enum';
import { ResponseDto } from '../../../common/dto/response.dto';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { CreateAnimeDto } from '../dto/create-anime.dto';
import { UpdateAnimeDto } from '../dto/update-anime.dto';

describe('UserController', () => {
  let animeController: AnimeController;
  let animeService: AnimeService;

  const mockUser: User = {
    id: 7,
    email: 'irori@gmail.com',
    nickname: 'irori',
    description: null,
    profile: null,
    retired: false,
    rank: UserRank.d,
    createdAt: new Date('2024-01-01'),
    password: '',
    animes: [] as Anime[],
    scraps: [] as Scrap[],
    reviews: [] as Review[],
  };

  const mockAnime = {
    id: 1,
    title: '귀멸의 칼날',
    source: AnimeSource.MANGA,
    description: 'test',
    animeParentId: null,
  } as Anime;

  const mockAnimeService = {
    getAnimeList: jest.fn(),
    getAnimeListByUser: jest.fn(),
    getAnimeSeries: jest.fn(),
    getAnimesBySeriesId: jest.fn(),
    createAnime: jest.fn(),
    updateAnime: jest.fn(),
    deleteAnime: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimeController],
      providers: DataMock.mockProviders([
        AnimeRepository,
        FileRepository,
        ScrapRepository,
        TagRepository,
        ReviewRepository,
      ]).concat({
        provide: AnimeService,
        useValue: mockAnimeService,
      }),
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    animeController = module.get<AnimeController>(AnimeController);
    animeService = module.get<AnimeService>(AnimeService);
  });

  it('should be defined', () => {
    expect(animeController).toBeDefined();
    expect(animeService).toBeDefined();
  });

  describe('getAnimeList', () => {
    it('should get Anime List', async () => {
      const responseData = new ResponseDto(
        EStatusCode.OK,
        [mockAnime, mockAnime, mockAnime],
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeService, 'getAnimeList').mockResolvedValue(responseData);

      const getAnimeListDto = {
        page: 1,
        limit: 20,
      } as GetAllAnimeQueryDto;

      const result = await animeController.getAnimeList(getAnimeListDto);

      expect(animeService.getAnimeList).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('getAnimeListByUser', () => {
    it('should get Anime related User List ', async () => {
      const responseData = new ResponseDto(
        EStatusCode.OK,
        {
          anime: [
            Object.assign(mockAnime, { averageScore: 1.2, reviewCount: 1 }),
          ],
          total: 1,
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeService, 'getAnimeListByUser')
        .mockResolvedValue(responseData);

      const getAnimeListDto = {
        page: 1,
        limit: 20,
      } as GetAllAnimeQueryDto;

      const result = await animeController.getAnimeListByUser(
        getAnimeListDto,
        mockUser,
      );

      expect(animeService.getAnimeListByUser).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('getAnimeSeries', () => {
    it('should get Parent Anime List', async () => {
      const responseData = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [mockAnime],
        },
        EResponseMessage.SUCCESS,
      );
      jest
        .spyOn(animeService, 'getAnimeSeries')
        .mockResolvedValue(responseData);
      const result = await animeController.getAnimeSeries();

      expect(animeService.getAnimeSeries).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('getAnimeSeriesBySeriesId', () => {
    it('같은 부모의 id를 가진 애니메이션 목록을 반환합니다.', async () => {
      const responseData = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [Object.assign(mockAnime, { id: 2, animeParentId: 1 })],
          series: mockAnime,
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeService, 'getAnimesBySeriesId')
        .mockResolvedValue(responseData);
      const result = await animeController.getAnimeSeriesBySeriesId(1);

      expect(animeService.getAnimesBySeriesId).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('createAnime', () => {
    it('애니메이션을 생성합니다.', async () => {
      const createAnimeDto = {
        title: '귀멸의 칼날 2',
        description: 'TEST',
        crew: '유포터블',
        source: AnimeSource.MANGA,
      } as CreateAnimeDto;

      const responseData = new ResponseDto(
        EStatusCode.OK,
        mockAnime,
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeService, 'createAnime').mockResolvedValue(responseData);
      const result = await animeController.createAnime(
        {},
        createAnimeDto,
        mockUser,
      );

      expect(animeService.createAnime).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('updateAnime', () => {
    it('애니메이션의 정보를 갱신합니다.', async () => {
      const updateAnimeDto = {
        title: '귀멸의 칼날 2',
        description: 'TEST',
        crew: '유포터블',
        source: AnimeSource.MANGA,
      } as UpdateAnimeDto;

      const responseData = new ResponseDto(
        EStatusCode.OK,
        Object.assign(mockAnime, updateAnimeDto) as Anime,
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeService, 'updateAnime').mockResolvedValue(responseData);
      const result = await animeController.updateAnime(
        mockAnime.id,
        updateAnimeDto,
        mockUser,
      );

      expect(animeService.updateAnime).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteAnime', () => {
    it('애니메이션을 삭제 처리합니다.', async () => {
      const responseData = new ResponseDto(
        EStatusCode.OK,
        null,
        EResponseMessage.DELETE_ITEM,
      );

      jest.spyOn(animeService, 'deleteAnime').mockResolvedValue(responseData);
      const result = await animeController.removeAnime(mockAnime.id, mockUser);

      expect(animeService.deleteAnime).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });
});
