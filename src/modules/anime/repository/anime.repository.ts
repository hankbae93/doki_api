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

  setManager(manager?: EntityManager): Repository<Anime> {
    return manager ? manager.getRepository(Anime) : this;
  }

  createAnime(anime: Partial<Anime>, manager?: EntityManager) {
    const newAnime = this.setManager(manager).create(anime);
    return this.setManager(manager).save(newAnime);
  }

  getAnimeBySeriesName(series: string, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {
        title: Like(`%${series}%`),
      },
    });
  }

  getAnimeWithReviews(animeId: number, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: {
        id: animeId,
      },
      relations: ['reviews'],
    });
  }

  getAnimeDetailById(id: number) {
    return this.createQueryBuilder('anime')
      .leftJoinAndSelect('anime.user', 'user_id')
      .leftJoinAndSelect('anime.tags', 'tag')
      .leftJoinAndSelect('anime.reviews', 'review')
      .leftJoinAndSelect('anime.images', 'image')
      .leftJoinAndSelect('review.user', 'user')
      .where('anime.id = :id', { id })
      .getOne();
  }

  findAnimeById(animeId: number) {
    return this.findOne({
      where: {
        id: animeId,
      },
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
      ])
      .groupBy('anime.id')
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

  getAnimeToDeleteById(animeId: number, manager?: EntityManager) {
    return this.setManager(manager).findOne({
      where: { id: animeId },
      relations: ['user', 'reviews'],
    });
  }

  deleteAnime(animeId: number, manager?: EntityManager) {
    return this.setManager(manager).update(animeId, { deleted: true });
  }

  updateAnime;
}
