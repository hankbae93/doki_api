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
import { StatusCodeEnum } from '../common/enum/status.enum';
import {
  ErrorMessageEnum,
  ResponseMessageEnum,
} from '../common/enum/message.enum';
import { AnimeOrder } from './anime.enum';
import { Crew } from '../crew/entities/crew.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Scrap)
    private scrapRepository: Repository<Scrap>,
    private dataSource: DataSource,
  ) {}
  async createAnime(createAnimeDto: CreateAnimeDto, user: User) {
    const {
      title,
      author = null,
      thumbnail,
      crew,
      tags = [],
      source,
      description,
    } = createAnimeDto;

    let crewWithRelations: Crew;

    const originCrew = await this.crewRepository.findOne({
      where: {
        name: crew,
      },
    });

    if (!originCrew) {
      crewWithRelations = await this.crewRepository.create({
        name: crew,
      });

      await this.crewRepository.save(crewWithRelations);
    }

    const tagsData: Tag[] = [];
    if (tags.length !== 0) {
      const tagsWithRelation = await Promise.all(
        tags.map((value) => {
          return this.tagRepository.findOne({
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
            const createdTag = await this.tagRepository.create({
              name: tags[index],
            });
            await this.tagRepository.save(createdTag);
            tagsData.push(createdTag);
          }
        }),
      );
    }

    const newAnime = this.animeRepository.create({
      title,
      author,
      source,
      averageScore: 0,
      animeParentId: null,
      thumbnail,
      description,
      crew: crewWithRelations || originCrew,
      tags: tagsData.length === 0 ? null : tagsData,
      user,
    });

    const anime = await this.animeRepository.save(newAnime);

    return new ResponseDto(
      StatusCodeEnum.CREATED,
      anime,
      ResponseMessageEnum.SUCCESS,
    );
  }

  getOrderBy = (order: AnimeOrder) => {
    switch (order) {
      case AnimeOrder.RECENT:
        return 'DESC';

      case AnimeOrder.OLD:
        return 'ASC';

      default:
        return 'DESC';
    }
  };

  async test(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
    } = getAnimeByPageDto;
    const animeRepository = this.dataSource.getRepository(Anime);

    const animeList = await animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.reviews', 'review')
      .select([
        'anime.id',
        'anime.title',
        'anime.author',
        'anime.description',
        'anime.thumbnail',
        'anime.source',
        'anime.average_score',
        'COUNT(review.id) AS reviewCount',
      ])
      .groupBy('anime.id')
      // .orderBy('COUNT(review.id)', 'DESC')
      // .offset(page)
      // .limit(limit)
      .getRawMany();

    return new ResponseDto(200, animeList, 'good');
  }

  async getAnimeList(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
    } = getAnimeByPageDto;

    const animeListQuery = this.dataSource
      .getRepository(Anime)
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.reviews', 'review')
      .select([
        'anime.id AS id',
        'anime.title AS title',
        'anime.author AS author',
        'anime.description AS description',
        'anime.thumbnail AS thumbnail',
        'anime.source AS source',
        'anime.average_score AS averageScore',
        'COUNT(review.id) AS reviewCount',
      ])
      .groupBy('anime.id')
      .offset(page - 1)
      .limit(limit);

    if (source) {
      animeListQuery.andWhere('anime.source = :source', { source });
    }

    if (title) {
      animeListQuery.andWhere('anime.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    animeListQuery.orderBy(
      order === AnimeOrder.TREND ? 'COUNT(review.id)' : 'anime.id',
      order === AnimeOrder.TREND ? 'DESC' : this.getOrderBy(order),
    );

    const data = await animeListQuery.getRawMany();

    const total = await animeListQuery.getCount();

    return new ResponseDto(
      StatusCodeEnum.OK,
      { animes: data, total },
      ResponseMessageEnum.SUCCESS,
    );
  }

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.user', 'user_id')
      .leftJoinAndSelect('anime.crew', 'crew')
      .leftJoinAndSelect('anime.tags', 'tag')
      .leftJoinAndSelect('anime.reviews', 'review')
      .leftJoinAndSelect('review.user', 'user')
      .where('anime.id = :id', { id })
      .getOne();

    let scrap = null;

    if (user) {
      scrap = await this.scrapRepository.findOne({
        where: {
          anime: {
            id: anime.id,
          },
          user: {
            id: user.id,
          },
        },
      });
    }

    console.log(scrap);

    if (!anime) {
      throw new NotFoundException(ErrorMessageEnum.NOT_FOUND);
    }

    return new ResponseDto(
      StatusCodeEnum.OK,
      { anime, scrap },
      ResponseMessageEnum.SUCCESS,
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

    let crewWithRelations: Crew;

    const anime = await this.animeRepository.findOneBy({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const animeRepository = this.dataSource.manager.getRepository(Anime);
    const tagRepository = this.dataSource.manager.getRepository(Tag);
    const crewRepository = this.dataSource.manager.getRepository(Crew);

    const originCrew = await crewRepository.findOne({
      where: {
        name: crew,
      },
    });

    if (!originCrew) {
      crewWithRelations = await crewRepository.create({
        name: crew,
      });

      await crewRepository.insert(crewWithRelations);
    }

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
      crew: crewWithRelations || originCrew,
      tags: tagsData,
    });

    await queryRunner.commitTransaction();

    return new ResponseDto(
      StatusCodeEnum.CREATED,
      updatedAnime,
      ResponseMessageEnum.SUCCESS,
    );
  }

  async removeAnime(id: number, user: User) {
    const anime = await this.animeRepository.findOne({
      where: { id },
    });

    if (user.id !== anime.user.id) {
      throw new ForbiddenException();
    }

    await this.animeRepository.remove(anime);

    return new ResponseDto(
      StatusCodeEnum.OK,
      null,
      ResponseMessageEnum.DELETE_ITEM,
    );
  }

  async 시발() {
    //   const animeListQuery = await this.dataSource
    //     .getRepository(Anime)
    //     .createQueryBuilder('anime')
    //     .leftJoinAndSelect('anime.reviews', 'review')
    //     .select([
    //       'anime.id',
    //       'anime.title',
    //       'anime.author',
    //       'anime.description',
    //       'anime.thumbnail',
    //       'anime.source',
    //       'anime.average_score',
    //       'COUNT(review.id) AS reviewCount',
    //     ])
    //     .offset(page)
    //     .limit(limit);
    //
    //   //
    //   if (source) {
    //     await animeListQuery.andWhere('anime.source = :source', { source });
    //   }
    //
    //   if (title) {
    //     animeListQuery.andWhere('anime.title = :title', {
    //       title: Like(`%${title}%`),
    //     });
    //   }
    //
    //   await animeListQuery.orderBy(
    //     order === AnimeOrder.TREND ? 'COUNT(review.id)' : 'anime.id',
    //     order === AnimeOrder.TREND ? 'DESC' : this.getOrderBy(order),
    //   );
    //
    //   const result = await animeListQuery.getRawMany();
    //
    //   const total = await animeListQuery.getCount();
    //
    //   const data = {
    //     animeList: animeListQuery,
    //     total,
    //   };
    //
    //   return new ResponseDto(
    //     StatusCodeEnum.OK,
    //     data,
    //     ResponseMessageEnum.SUCCESS,
    //   );
  }
}
