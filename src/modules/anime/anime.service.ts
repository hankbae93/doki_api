import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { ResponseDto } from '../../common/dto/responseDto';
import { EStatusCode } from '../../common/enum/status.enum';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../common/enum/message.enum';
import { Tag } from '../tag/entities/tag.entity';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from '../scrap/repository/scrap.repository';
import { ReviewRepository } from '../review/repository/review.repository';
import { ImageRepository } from './repository/image.repository';
import { TagRepository } from '../tag/repository/tag.repository';

@Injectable()
export class AnimeService {
  constructor(
    private animeRepository: AnimeRepository,
    private scrapRepository: ScrapRepository,
    private reviewRepository: ReviewRepository,
    private imageRepository: ImageRepository,
    private tagRepository: TagRepository,
    private dataSource: DataSource,
  ) {}

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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let animeParentId: number | null = null;
      if (series) {
        const originAnime = await this.animeRepository.getAnimeBySeriesName(
          series,
          queryRunner.manager,
        );

        if (originAnime) {
          animeParentId = originAnime.id;
        }
      }

      const tagsData: Tag[] = [];
      if (tags.length !== 0) {
        const tagsWithRelation = await Promise.all(
          tags.map((value) => {
            return this.tagRepository.findTagByName(value, queryRunner.manager);
          }),
        );

        await Promise.all(
          tagsWithRelation.map(async (data, index) => {
            if (data) {
              return tagsData.push(data);
            } else {
              const createdTag = await this.tagRepository
                .setManager(queryRunner.manager)
                .create({
                  name: tags[index],
                });
              await this.tagRepository
                .setManager(queryRunner.manager)
                .save(createdTag);
              tagsData.push(createdTag);
            }
          }),
        );
      }

      const newAnime = this.animeRepository
        .setManager(queryRunner.manager)
        .create({
          title,
          author,
          source,
          averageScore: 0,
          animeParentId,
          thumbnail: files.file[0].path,
          description,
          // crew: crewWithRelations || originCrew,
          tags: tagsData.length === 0 ? null : tagsData,
          user,
        });
      const anime = await this.animeRepository
        .setManager(queryRunner.manager)
        .save(newAnime);

      // 이미지 엔티티 업데이트
      const newImages = await this.imageRepository
        .setManager(queryRunner.manager)
        .create(
          files.file.map((file) => ({
            anime,
            fileName: file.path,
          })),
        );

      await this.imageRepository
        .setManager(queryRunner.manager)
        .insert(newImages);

      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.CREATED,
        anime,
        EResponseMessage.SUCCESS,
      );
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository.getAnimeById(id);

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

    const anime = await this.animeRepository.findOneBy({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const tagsData: Tag[] = [];
    if (tags.length !== 0) {
      const tagsWithRelation = await Promise.all(
        tags.map((value) => {
          return this.tagRepository.findTagByName(value, queryRunner.manager);
        }),
      );

      await Promise.all(
        tagsWithRelation.map(async (data, index) => {
          if (data) {
            return tagsData.push(data);
          } else {
            const createdTag = await this.tagRepository
              .setManager(queryRunner.manager)
              .create({
                name: tags[index],
              });
            await this.tagRepository
              .setManager(queryRunner.manager)
              .insert(createdTag);
            tagsData.push(createdTag);
          }
        }),
      );
    }

    const updatedAnime = await this.animeRepository
      .setManager(queryRunner.manager)
      .save({
        ...anime,
        title,
        author,
        source,
        animeParentId: null,
        thumbnail,
        description,
        tags: tagsData,
      });

    await queryRunner.commitTransaction();

    return new ResponseDto(
      EStatusCode.CREATED,
      updatedAnime,
      EResponseMessage.SUCCESS,
    );
  }

  async removeAnime(id: number, user: User) {
    const anime = await this.animeRepository.getAnimeToDeleteById(id);

    if (user.id !== anime.user.id) {
      throw new ForbiddenException();
    }

    await this.reviewRepository.remove(anime.reviews);
    await this.animeRepository.remove(anime);

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
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
}
