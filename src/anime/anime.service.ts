import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { Tag } from '../tag/entities/tag.entity';
import { Image } from './entities/image.entity';
import { Review } from '../review/entities/review.entity';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from './repository/scrap.repository';

@Injectable()
export class AnimeService {
  constructor(
    private animeRepository: AnimeRepository,
    private scrapRepository: ScrapRepository,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private dataSource: DataSource,
  ) {}
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
    const animeRepository = this.dataSource.manager.getRepository(Anime);
    const tagRepository = this.dataSource.manager.getRepository(Tag);
    const imageRepository = this.dataSource.manager.getRepository(Image);

    try {
      // let crewWithRelations: Crew;
      let animeParentId: number | null = null;
      if (series) {
        const originAnime = await animeRepository.findOne({
          where: {
            title: Like(`%${series}%`),
          },
        });
        if (originAnime) {
          animeParentId = originAnime.id;
        }
      }

      // const originCrew = await crewRepository.findOne({
      //   where: {
      //     name: crew,
      //   },
      // });
      //
      // if (!originCrew) {
      //   crewWithRelations = await crewRepository.create({
      //     name: crew,
      //   });
      //
      //   await crewRepository.save(crewWithRelations);
      // }

      const tagsData: Tag[] = [];
      if (tags.length !== 0) {
        const tagsWithRelation = await Promise.all(
          tags.map((value) => {
            return tagRepository.findOne({
              where: {
                name: value,
              },
            });
          }),
        );

        await Promise.all(
          tagsWithRelation.map(async (data, index) => {
            if (data) {
              return tagsData.push(data);
            } else {
              const createdTag = await tagRepository.create({
                name: tags[index],
              });
              await tagRepository.save(createdTag);
              tagsData.push(createdTag);
            }
          }),
        );
      }

      const newAnime = animeRepository.create({
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
      const anime = await this.animeRepository.save(newAnime);

      // 이미지 엔티티 업데이트
      const newImages = await imageRepository.create(
        files.file.map((file) => ({
          anime,
          fileName: file.path,
        })),
      );

      await imageRepository.insert(newImages);

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

  async getAnimeListByUser(getAnimeByPageDto: GetAllAnimeQueryDto, user: User) {
    const { data, total } = await this.animeRepository.getAnimesByPageAndUserId(
      getAnimeByPageDto,
      user.id,
    );
    const tags = await this.tagRepository.find({
      relations: ['animes'],
    });

    const result = data.map((item) => {
      const data = [];

      tags.forEach((tag) => {
        const animeTag = tag.animes.find((anime) => anime.id === item.id);
        if (animeTag) {
          data.push({ id: tag.id, name: tag.name });
        }
      });

      return {
        ...item,
        tags: data,
      };
    });

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimeList(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const { data, total } = await this.animeRepository.getAnimesByPage(
      getAnimeByPageDto,
    );

    const tags = await this.tagRepository.find({
      relations: ['animes'],
    });

    const result = data.map((item) => {
      const data = [];

      tags.forEach((tag) => {
        const animeTag = tag.animes.find((anime) => anime.id === item.id);
        if (animeTag) {
          data.push({ id: tag.id, name: tag.name });
        }
      });

      return {
        ...item,
        tags: data,
      };
    });

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository.getAnimeById(id);

    const scrap = user
      ? await this.scrapRepository.getScrapsByIds(id, user.id)
      : null;
    console.log(scrap);
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

    // let crewWithRelations: Crew;

    const anime = await this.animeRepository.findOneBy({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const animeRepository = this.dataSource.manager.getRepository(Anime);
    const tagRepository = this.dataSource.manager.getRepository(Tag);
    // const crewRepository = this.dataSource.manager.getRepository(Crew);

    // const originCrew = await crewRepository.findOne({
    //   where: {
    //     name: crew,
    //   },
    // });

    // if (!originCrew) {
    //   crewWithRelations = await crewRepository.create({
    //     name: crew,
    //   });
    //
    //   await crewRepository.insert(crewWithRelations);
    // }

    const tagsData: Tag[] = [];
    if (tags.length !== 0) {
      const tagsWithRelation = await Promise.all(
        tags.map((value) => {
          return tagRepository.findOne({
            where: {
              name: value,
            },
          });
        }),
      );

      await Promise.all(
        tagsWithRelation.map(async (data, index) => {
          if (data) {
            return tagsData.push(data);
          } else {
            const createdTag = await tagRepository.create({
              name: tags[index],
            });
            await this.tagRepository.insert(createdTag);
            tagsData.push(createdTag);
          }
        }),
      );
    }

    const updatedAnime = await animeRepository.save({
      ...anime,
      title,
      author,
      source,
      animeParentId: null,
      thumbnail,
      description,
      // crew: crewWithRelations || originCrew,
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
