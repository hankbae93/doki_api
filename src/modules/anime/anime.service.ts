import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../common/enum/message.enum';
import { Tag } from '../tag/entities/tag.entity';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from '../scrap/repository/scrap.repository';
import { ReviewRepository } from '../review/repository/review.repository';
import { FileRepository } from '../file/repository/file.repository';
import { TagRepository } from '../tag/repository/tag.repository';
import { TransactionHelper } from '../../common/helper/transaction.helper';

@Injectable()
export class AnimeService {
  constructor(
    private animeRepository: AnimeRepository,
    private scrapRepository: ScrapRepository,
    private reviewRepository: ReviewRepository,
    private imageRepository: FileRepository,
    private tagRepository: TagRepository,
    private dataSource: DataSource,
  ) {}

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository.getAnimeDetailById(id);

    const scrap = user
      ? await this.scrapRepository.getScrapsByIds(id, user.id)
      : null;

    if (!anime) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return new ResponseDto(
      EStatusCode.OK,
      { anime, isScrapped: !!scrap },
      EResponseMessage.SUCCESS,
    );
  }

  async addTagToAnimeList(animes: any[]) {
    const tags = await this.tagRepository.findAllWithAnimes();
    return animes.map((item) => {
      const data = [];

      tags.forEach((tag) => {
        const animeTag = tag.animes.find((anime) => anime.id === item.id);
        if (animeTag) {
          data.push({ tagId: tag.id, tagName: tag.name });
        }
      });

      return {
        ...item,
        tags: data,
      };
    });
  }

  async getAnimeList(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const { data, total } = await this.animeRepository.getAnimesByPage(
      getAnimeByPageDto,
    );
    const result = await this.addTagToAnimeList(data);

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimeListByUser(getAnimeByPageDto: GetAllAnimeQueryDto, user: User) {
    const { data, total } = await this.animeRepository.getAnimesByPageAndUserId(
      getAnimeByPageDto,
      user.id,
    );
    const result = await this.addTagToAnimeList(data);

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimeSeries() {
    const animes = await this.animeRepository.getOriginalAnimes();

    return new ResponseDto(
      EStatusCode.OK,
      {
        animes,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimesBySeriesId(seriesId: number) {
    const animes = await this.animeRepository.getAnimesBySeriesId(seriesId);
    const series = animes.find((anime) => anime.id === seriesId);

    return new ResponseDto(
      EStatusCode.OK,
      {
        animes: animes.filter((anime) => anime.id !== seriesId),
        series,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async createAnime(
    createAnimeDto: CreateAnimeDto,
    files: {
      video?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
    user: User,
  ) {
    const {
      title,
      author = null,
      crew,
      tags = [],
      source,
      description,
      series = '',
    } = createAnimeDto;

    const result = await TransactionHelper.transaction(
      this.dataSource,
      async (entityManager: EntityManager) => {
        let animeParentId: number | null = null;
        if (series) {
          const originAnime = await this.animeRepository.getAnimeBySeriesName(
            series,
            entityManager,
          );

          if (originAnime) {
            animeParentId = originAnime.id;
          }
        }

        let tagData: Tag[] = [];

        if (tags.length > 0) {
          const tagsWithRelation = await this.tagRepository.findTagsByName(
            tags,
            entityManager,
          );
          const newTags = await this.tagRepository.createTag(
            tags.filter((tagValue) =>
              tagsWithRelation.some((tag) => tag.name === tagValue),
            ),
            entityManager,
          );

          tagData = tagsWithRelation.concat(newTags);
        }

        const newAnime = await this.animeRepository.createAnime(
          {
            title,
            author,
            source,
            averageScore: 0,
            animeParentId,
            thumbnail: files.file[0].path,
            description,
            crew,
            tags: tagData.length === 0 ? null : tagData,
            user,
          },
          entityManager,
        );

        // 이미지 엔티티 업데이트
        await this.imageRepository.createFiles(
          files.file.map((file) => ({
            anime: newAnime,
            fileName: file.path,
          })),
          entityManager,
        );

        return newAnime;
      },
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      result,
      EResponseMessage.SUCCESS,
    );
  }

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto, user) {
    const {
      title,
      author = null,
      thumbnail,
      crew,
      tags = [],
      source,
      description,
    } = updateAnimeDto;

    const result = await TransactionHelper.transaction(
      this.dataSource,
      async (entityManager) => {
        const anime = await this.animeRepository
          .setManager(entityManager)
          .findOneBy({ id });

        if (user.id !== anime.user.id) {
          throw new ForbiddenException();
        }

        let tagData: Tag[] = [];

        if (tags.length > 0) {
          const tagsWithRelation = await this.tagRepository.findTagsByName(
            tags,
            entityManager,
          );
          const newTags = await this.tagRepository.createTag(
            tags.filter((tagValue) =>
              tagsWithRelation.some((tag) => tag.name === tagValue),
            ),
            entityManager,
          );

          tagData = tagsWithRelation.concat(newTags);
        }

        return await this.animeRepository.setManager(entityManager).save({
          ...anime,
          title,
          author,
          source,
          crew,
          animeParentId: null,
          thumbnail,
          description,
          tags: tagData.length === 0 ? null : tagData,
        });
      },
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      result,
      EResponseMessage.SUCCESS,
    );
  }

  async removeAnime(id: number, user: User) {
    await TransactionHelper.transaction(
      this.dataSource,
      async (entityManager) => {
        const anime = await this.animeRepository.getAnimeToDeleteById(
          id,
          entityManager,
        );

        if (user.id !== anime.user.id) {
          throw new ForbiddenException();
        }

        await this.reviewRepository.deleteReviews(
          anime.reviews.map((review) => review.id),
          entityManager,
        );
        await this.animeRepository.deleteAnime(anime.id, entityManager);
      },
    );

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
  }
}
