import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, IsNull, Like, Repository } from 'typeorm';
import { Anime } from '../entities/anime.entity';
import { AnimeOrder } from '../anime.enum';
import { GetAllAnimeQueryDto } from '../dto/get-all-anime-query.dto';

@Injectable()
export class AnimeRepository extends Repository<Anime> {
  constructor(private dataSource: DataSource) {
    super(Anime, dataSource.createEntityManager());
  }

  setManager(manager: EntityManager) {
    if (!manager) return this;

    const allProperties = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    );

    // 'setManager' 제외하고 필터링
    const methodsToExtend = allProperties.filter((property) => {
      return typeof this[property] === 'function' && property !== 'setManager';
    });

    // extend 메소드에 전달할 객체 생성
    const methods = methodsToExtend.reduce((obj, method) => {
      obj[method] = this[method];
      return obj;
    }, {}) as AnimeRepository;

    return manager.getRepository(Anime).extend(methods);
  }

  saveAnime(anime: Anime) {
    return this.save(anime);
  }

  findAnimeById(animeId: number) {
    return this.findOne({
      where: {
        id: animeId,
      },
    });
  }

  createAnime(anime: Partial<Anime>) {
    const newAnime = this.create(anime);
    return this.save(newAnime);
  }

  getAnimeBySeriesName(series: string) {
    return this.findOne({
      where: {
        title: Like(`%${series}%`),
      },
    });
  }

  getAnimeWithReviews(animeId: number) {
    return this.findOne({
      where: {
        id: animeId,
      },
      relations: ['reviews'],
    });
  }

  getAnimeDetailById(animeId: number) {
    return this.createQueryBuilder('anime')
      .leftJoinAndSelect('anime.user', 'user_id')
      .leftJoinAndSelect('anime.tags', 'tag')
      .leftJoinAndSelect('anime.reviews', 'review')
      .leftJoinAndSelect('anime.files', 'files')
      .leftJoinAndSelect('review.user', 'user')
      .where('anime.id = :id', { id: animeId })
      .getOne();
  }

  findAnimeWithUserById(animeId: number) {
    return this.findOne({
      where: {
        id: animeId,
      },
      relations: ['user'],
    });
  }

  async getAnimesByPage(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
      condition = false,
    } = getAnimeByPageDto;

    const animeListQuery = this.createQueryBuilder('anime').leftJoin(
      'anime.reviews',
      'review',
    );

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
      ])
      .groupBy('anime.id')
      .offset((page - 1) * limit)
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

    const data = await animeListQuery.getRawMany().then((list) =>
      list.map((anime) => {
        return {
          ...anime,
          averageScore: parseFloat(anime.averageScore),
          reviewCount: parseInt(anime.reviewCount),
        };
      }),
    );
    const total = await animeListQuery.getCount();

    return { data, total };
  }

  async getAnimesByPageAndUserId(
    getAnimeByPageDto: GetAllAnimeQueryDto,
    userId: number,
  ) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
      condition = false,
    } = getAnimeByPageDto;

    const animeListQuery = this.createQueryBuilder('anime')
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
        'scrap.id as scrapId',
      ])
      .groupBy('anime.id,scrap.id')
      .setParameter('userId', userId)
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
    const total = await animeListQuery.getCount();

    return { data, total };
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

  getOriginalAnimes() {
    return this.find({
      where: {
        animeParentId: IsNull(),
      },
    });
  }

  getAnimesBySeriesId(seriesId: number) {
    return this.find({
      where: [
        {
          animeParentId: seriesId,
        },
        {
          id: seriesId,
        },
      ],
      relations: ['tags'],
    });
  }

  getAnimeToDeleteById(animeId: number) {
    return this.findOne({
      where: { id: animeId },
      relations: ['user', 'reviews'],
    });
  }

  deleteAnime(animeId: number) {
    return this.update(animeId, { deleted: true });
  }

  updateAnime(animeId: number, updateColumns: Partial<Anime>) {
    return this.save(updateColumns);

    // .update(animeId, updateColumns);
  }
}
