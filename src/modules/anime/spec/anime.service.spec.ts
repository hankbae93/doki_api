import { Test, TestingModule } from '@nestjs/testing';
import { AnimeService } from '../anime.service';
import { AnimeRepository } from '../repository/anime.repository';
import { ScrapRepository } from '../../scrap/repository/scrap.repository';
import { ReviewRepository } from '../../review/repository/review.repository';
import { FileRepository } from '../../file/repository/file.repository';
import { TagRepository } from '../../tag/repository/tag.repository';
import { DataSource } from 'typeorm';
import { EntityMock } from '../../../common/mock/entity.mock';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { EStatusCode } from '../../../common/enum/status.enum';
import { ResponseDto } from '../../../common/dto/response.dto';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { NotFoundException } from '@nestjs/common';
import { GetAllAnimeQueryDto } from '../dto/get-all-anime-query.dto';
import { ConnectionMock } from '../../../common/mock/connection.mock';
import { CreateAnimeDto } from '../dto/create-anime.dto';

describe('animeService', () => {
  let animeService: AnimeService;
  let animeRepository: AnimeRepository;
  let scrapRepository: ScrapRepository;
  let reviewRepository: ReviewRepository;
  let fileRepository: FileRepository;
  let tagRepository: TagRepository;
  let dataSource: DataSource;

  const mockAnimeRepository = {
    getAnimeDetailById: jest.fn(),
    getAnimesByPage: jest.fn(),
    getAnimesByPageAndUserId: jest.fn(),
    getOriginalAnimes: jest.fn(),
    getAnimesBySeriesId: jest.fn(),
    createAnime: jest.fn(),
    getAnimeBySeriesName: jest.fn(),
  };
  const mockScrapRepository = {
    getScrapsByIds: jest.fn(),
  };
  const mockReviewRepository = {};
  const mockFileRepository = {
    createFiles: jest.fn(),
  };
  const mockTagRepository = {
    findAllWithAnimes: jest.fn().mockResolvedValue([EntityMock.mockTag()]),
    findTagsByName: jest.fn(),
    createTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimeService,
        { provide: AnimeRepository, useValue: mockAnimeRepository },
        { provide: ScrapRepository, useValue: mockScrapRepository },
        { provide: ReviewRepository, useValue: mockReviewRepository },
        { provide: FileRepository, useValue: mockFileRepository },
        { provide: TagRepository, useValue: mockTagRepository },
        {
          provide: DataSource,
          useClass: ConnectionMock,
        },
      ],
    }).compile();

    animeService = module.get<AnimeService>(AnimeService);
    animeRepository = module.get<AnimeRepository>(AnimeRepository);
    scrapRepository = module.get<ScrapRepository>(ScrapRepository);
    reviewRepository = module.get<ReviewRepository>(ReviewRepository);
    fileRepository = module.get<FileRepository>(FileRepository);
    tagRepository = module.get<TagRepository>(TagRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('getAnimeDetail', () => {
    it('비로그인 상태일 때, 애니메이션 정보만 조회된다.', async () => {
      const anime = EntityMock.mockAnime();
      const response = new ResponseDto(
        EStatusCode.OK,
        { anime, isScrapped: false },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getAnimeDetailById')
        .mockResolvedValue(anime);

      const result = await animeService.getAnimeDetail(1);

      expect(animeRepository.getAnimeDetailById).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('로그인 상태일 때, 애니메이션 정보와 스크랩 정보가 조회된다.', async () => {
      const anime = EntityMock.mockAnime();
      const response = new ResponseDto(
        EStatusCode.OK,
        { anime, isScrapped: true },
        EResponseMessage.SUCCESS,
      );
      const user = EntityMock.mockUser();
      jest
        .spyOn(animeRepository, 'getAnimeDetailById')
        .mockResolvedValue(anime);

      jest
        .spyOn(scrapRepository, 'getScrapsByIds')
        .mockResolvedValue(new Scrap());

      const result = await animeService.getAnimeDetail(1, user);
      expect(scrapRepository.getScrapsByIds).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('애니메이션이 존재하지 않다면 에러를 던집니다.', async () => {
      const animeId = EntityMock.mockAnime().id;
      const user = EntityMock.mockUser();
      jest.spyOn(animeRepository, 'getAnimeDetailById').mockResolvedValue(null);

      await expect(
        animeService.getAnimeDetail(animeId, user),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('addTagToAnimeList', () => {
    it('리스트의 각 애니메이션에 태그를 추가해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const tag = EntityMock.mockTag();

      const result = await animeService.addTagToAnimeList([anime]);

      expect(tagRepository.findAllWithAnimes).toHaveBeenCalled();
      expect(result).toEqual([
        Object.assign(anime, { tags: [{ tagId: tag.id, tagName: tag.name }] }),
      ]);
    });
  });

  describe('getAnimeList', () => {
    it('페이지가 매겨진 애니메이션 목록을 반환해야 합니다.', async () => {
      const dto = {
        page: 1,
        limit: 10,
      } as GetAllAnimeQueryDto;
      const anime = EntityMock.mockAnime();
      const tag = EntityMock.mockTag();
      const response = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [
            Object.assign(anime, {
              tags: [{ tagId: tag.id, tagName: tag.name }],
            }),
          ],
          total: 1,
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getAnimesByPage')
        .mockResolvedValue({ data: [anime], total: 1 });

      const result = await animeService.getAnimeList(dto);

      expect(animeRepository.getAnimesByPage).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('getAnimeListByUser', () => {
    it('유저와 관련된 정보가 담긴 애니메이션의 페이지가 매겨진 목록을 반환해야 합니다.', async () => {
      const dto = {
        page: 1,
        limit: 10,
      } as GetAllAnimeQueryDto;
      const user = EntityMock.mockUser();
      const anime = EntityMock.mockAnime();
      const tag = EntityMock.mockTag();
      const response = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [
            Object.assign(anime, {
              tags: [{ tagId: tag.id, tagName: tag.name }],
            }),
          ],
          total: 1,
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getAnimesByPageAndUserId')
        .mockResolvedValue({ data: [anime], total: 1 });

      const result = await animeService.getAnimeListByUser(dto, user);

      expect(animeRepository.getAnimesByPageAndUserId).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('getAnimeSeries', () => {
    it('부모가 되는 애니메이션 목록을 반환해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const response = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [anime],
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getOriginalAnimes')
        .mockResolvedValue([anime]);

      const result = await animeService.getAnimeSeries();

      expect(animeRepository.getOriginalAnimes).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('getAnimesBySeriesId', () => {
    it('부모에 속하는 애니메이션 목록을 반환해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const response = new ResponseDto(
        EStatusCode.OK,
        {
          animes: [anime].filter((anime) => anime.id !== 1),
          series: anime,
        },
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getAnimesBySeriesId')
        .mockResolvedValue([anime]);
      const result = await animeService.getAnimesBySeriesId(anime.id);

      expect(animeRepository.getAnimesBySeriesId).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('부모에 속하는 애니메이션의 아이디가 유효하지 않으면 에러를 던집니다.', async () => {
      const anime = EntityMock.mockAnime();

      jest.spyOn(animeRepository, 'getAnimesBySeriesId').mockResolvedValue([]);

      await expect(
        animeService.getAnimesBySeriesId(anime.id),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createAnime', () => {
    it('새로운 애니메이션을 생성해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const user = EntityMock.mockUser();
      const files = {
        file: [{ path: '' } as Express.Multer.File],
      };
      const dto = {
        title: anime.title,
        description: anime.description,
        crew: anime.crew,
        source: anime.source,
      } as CreateAnimeDto;

      const response = new ResponseDto(
        EStatusCode.CREATED,
        anime,
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeRepository, 'createAnime').mockResolvedValue(anime);

      const result = await animeService.createAnime(dto, files, user);

      expect(animeRepository.createAnime).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('태그를 받으면 새 애니메이션을 태그와 연결해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const user = EntityMock.mockUser();
      const tag = EntityMock.mockTag();
      const files = {
        file: [{ path: '' } as Express.Multer.File],
      };
      const dto = {
        title: anime.title,
        description: anime.description,
        crew: anime.crew,
        source: anime.source,
        tags: [tag.name],
      } as CreateAnimeDto;

      const response = new ResponseDto(
        EStatusCode.CREATED,
        Object.assign(anime, { tags: [{ tagId: tag.id, tagName: tag.name }] }),
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeRepository, 'createAnime').mockResolvedValue(anime);
      jest.spyOn(tagRepository, 'findTagsByName').mockResolvedValue([tag]);

      const result = await animeService.createAnime(dto, files, user);

      expect(tagRepository.findTagsByName).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('태그가 테이블에 없으면 생성해서라도 새 애니메이션을 태그와 연결해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const user = EntityMock.mockUser();
      const tag = EntityMock.mockTag();
      const files = {
        file: [{ path: '' } as Express.Multer.File],
      };
      const dto = {
        title: anime.title,
        description: anime.description,
        crew: anime.crew,
        source: anime.source,
        tags: [tag.name],
      } as CreateAnimeDto;
      const response = new ResponseDto(
        EStatusCode.CREATED,
        Object.assign(anime, { tags: [{ tagId: tag.id, tagName: tag.name }] }),
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(animeRepository, 'createAnime').mockResolvedValue(anime);

      const result = await animeService.createAnime(dto, files, user);

      expect(tagRepository.createTag).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('시리즈의 부모 애니메이션 아이디를 받으면 새 애니메이션을 시리즈와 연결해야 합니다.', async () => {
      const anime = EntityMock.mockAnime();
      const user = EntityMock.mockUser();
      const files = {
        file: [{ path: '' } as Express.Multer.File],
      };
      const dto = {
        title: 'TEST_TEST',
        description: anime.description,
        crew: anime.crew,
        source: anime.source,
        series: anime.title,
      } as CreateAnimeDto;

      const response = new ResponseDto(
        EStatusCode.CREATED,
        Object.assign(anime, { animeParentId: anime.id }),
        EResponseMessage.SUCCESS,
      );

      jest
        .spyOn(animeRepository, 'getAnimeBySeriesName')
        .mockResolvedValue(Object.assign(anime, { id: 2 }));
      jest
        .spyOn(animeRepository, 'createAnime')
        .mockResolvedValue(Object.assign(anime, { animeParentId: 2 }));

      const result = await animeService.createAnime(dto, files, user);

      expect(animeRepository.getAnimeBySeriesName).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('updateAnime', () => {
    it('should update anime details', () => {
      // Test logic here
    });

    it('should update tags associated with the anime', () => {
      // Test logic here
    });

    it('should throw ForbiddenException if user is unauthorized', () => {
      // Test logic here
    });
  });

  describe('removeAnime', () => {
    it('should remove an anime', () => {
      // Test logic here
    });

    it('should remove related reviews when deleting an anime', () => {
      // Test logic here
    });

    it('should throw ForbiddenException if user is unauthorized', () => {
      // Test logic here
    });
  });
});
