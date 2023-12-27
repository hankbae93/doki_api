import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { DataSource, IsNull, Like, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { AnimeOrder } from './anime.enum';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { Image } from '../image/entities/image.entity';
import { Review } from '../review/entities/review.entity';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Scrap)
    private scrapRepository: Repository<Scrap>,
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
      //
      // if (files.video && files.video[0]) {
      //   const newVideo = await videoRepository.create({
      //     anime,
      //     fileName: files.video[0].path,
      //   });
      //   await videoRepository.insert(newVideo);
      // }

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

  async getAnimeListByUser(getAnimeByPageDto: GetAllAnimeQueryDto, user: User) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
      condition = false,
    } = getAnimeByPageDto;

    const animeListQuery = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.reviews', 'review')
      .leftJoin('anime.scraps', 'scrap');

    if (tag) {
      animeListQuery
        .innerJoin('anime_tags_tag', 'att', 'anime.id = att.anime_id')
        .innerJoin('tag', 'tag', 'tag.id = att.tag_id');

      condition
        ? tag.forEach((tag, index) => {
            animeListQuery.andWhere(`tag.name = :tagName${index}`, {
              [`tagName${index}`]: tag,
            });
          })
        : tag.forEach((tag, index) => {
            animeListQuery.orWhere(`tag.name = :tagName${index}`, {
              [`tagName${index}`]: tag,
            });
          });
    }

    animeListQuery
      .select([
        'anime.id AS id',
        'anime.title AS title',
        'anime.author AS author',
        'anime.description AS description',
        'anime.thumbnail AS thumbnail',
        'anime.source AS source',
        'anime.average_score AS averageScore',
        `(EXISTS (SELECT 1 FROM scrap WHERE scrap.user_id = :userId AND scrap.anime_id = anime.id)) AS isScrapped`,
        'COUNT(review.id) AS reviewCount',
      ])
      .groupBy('anime.id')
      .setParameter('userId', user.id)
      .offset(page - 1)
      .limit(limit);

    if (source) {
      condition
        ? animeListQuery.andWhere('anime.source = :source', { source })
        : animeListQuery.orWhere('anime.source = :source', { source });
    }

    if (title) {
      condition
        ? animeListQuery.andWhere('anime.title LIKE :title', {
            title: `%${title}%`,
          })
        : animeListQuery.orWhere('anime.title LIKE :title', {
            title: `%${title}%`,
          });
    }

    animeListQuery.orderBy(
      order === AnimeOrder.TREND ? 'COUNT(review.id)' : 'anime.id',
      order === AnimeOrder.TREND ? 'DESC' : this.getOrderBy(order),
    );

    const data = await animeListQuery.getRawMany();

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

    const total = await animeListQuery.getCount();

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  /**
   SELECT
     `anime`.`id` AS id,
     `anime`.`title` AS title,
     `anime`.`author` AS author,
     `anime`.`description` AS description,
     `anime`.`thumbnail` AS thumbnail,
     `anime`.`source` AS source,
     `anime`.`average_score` AS averageScore,
     (EXISTS (SELECT 1 FROM scrap WHERE `scrap`.`user_id` = ? AND `scrap`.`anime_id` = `anime`.`id`)) AS isScrapped,
     COUNT(`review`.`id`) AS reviewCount,
     `anime`.`anime_id`
   FROM `anime` `anime`
    LEFT JOIN `review` `review` ON `review`.`anime_id`=`anime`.`id`
    LEFT JOIN `scrap` `scrap` ON `scrap`.`anime_id`=`anime`.`id`
    LEFT JOIN `video` `video` ON `video`.`anime_id`=`anime`.`id`
   GROUP BY `anime`.`id`
   ORDER BY `anime`.`id`
   DESC LIMIT 10
   */
  async getAnimeList(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
      condition = false,
    } = getAnimeByPageDto;

    const animeListQuery = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.reviews', 'review');

    if (tag) {
      animeListQuery
        .innerJoin('anime_tags_tag', 'att', 'anime.id = att.anime_id')
        .innerJoin('tag', 'tag', 'tag.id = att.tag_id');

      condition
        ? tag.forEach((tag, index) => {
            animeListQuery.andWhere(`tag.name = :tagName${index}`, {
              [`tagName${index}`]: tag,
            });
          })
        : tag.forEach((tag, index) => {
            animeListQuery.orWhere(`tag.name = :tagName${index}`, {
              [`tagName${index}`]: tag,
            });
          });
    }

    animeListQuery
      .select([
        'anime.id AS id',
        'anime.title AS title',
        'anime.author AS author',
        'anime.description AS description',
        'anime.thumbnail AS thumbnail',
        'anime.source AS source',
        'anime.average_score AS averageScore',
        'COUNT(review.id) AS reviewCount',
        'video.file_name AS video',
      ])
      .groupBy('anime.id')
      .offset(page - 1)
      .limit(limit);

    if (source) {
      condition
        ? animeListQuery.andWhere('anime.source = :source', { source })
        : animeListQuery.orWhere('anime.source = :source', { source });
    }

    if (title) {
      condition
        ? animeListQuery.andWhere('anime.title LIKE :title', {
            title: `%${title}%`,
          })
        : animeListQuery.orWhere('anime.title LIKE :title', {
            title: `%${title}%`,
          });
    }

    animeListQuery.orderBy(
      order === AnimeOrder.TREND ? 'COUNT(review.id)' : 'anime.id',
      order === AnimeOrder.TREND ? 'DESC' : this.getOrderBy(order),
    );

    const data = await animeListQuery.getRawMany();

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

    const total = await animeListQuery.getCount();

    return new ResponseDto(
      EStatusCode.OK,
      { animes: result, total },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.user', 'user_id')
      .leftJoinAndSelect('anime.crew', 'crew')
      .leftJoinAndSelect('anime.tags', 'tag')
      .leftJoinAndSelect('anime.reviews', 'review')
      .leftJoinAndSelect('anime.images', 'image')
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

    if (!anime) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return new ResponseDto(
      EStatusCode.OK,
      { anime, scrap },
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
    const anime = await this.animeRepository.findOne({
      where: { id },
      relations: ['user', 'reviews'],
    });

    if (user.id !== anime.user.id) {
      throw new ForbiddenException();
    }

    await this.reviewRepository.remove(anime.reviews);
    await this.animeRepository.remove(anime);

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
  }

  async getAnimeSeries() {
    const animes = await this.animeRepository.find({
      where: {
        animeParentId: IsNull(),
      },
    });

    return new ResponseDto(
      EStatusCode.OK,
      {
        animes,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async getAnimesBySeriesId(seriesId: number) {
    const animes = await this.animeRepository.find({
      where: [
        {
          animeParentId: seriesId,
        },
        {
          id: seriesId,
        },
      ],
      relations: ['crew', 'tags'],
    });

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
