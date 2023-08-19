import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Like, Repository } from 'typeorm';
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

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
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

  async getAllAnime(getAnimeByPageDto: GetAllAnimeQueryDto) {
    const {
      page,
      limit,
      tag,
      source = null,
      title = null,
      order = null,
    } = getAnimeByPageDto;

    const [animes, total] = await this.animeRepository.findAndCount({
      where: {
        ...(source && { source }),
        ...(tag && { tag }),
        ...(title && { title: Like(`%${title}%`) }),
      },
      order: {
        id: this.getOrderBy(order),
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const data = {
      animes,
      total,
    };

    return new ResponseDto(
      StatusCodeEnum.OK,
      data,
      ResponseMessageEnum.SUCCESS,
    );
  }

  async getAnime(id: number) {
    const anime = await this.animeRepository.findOne({
      where: {
        id,
      },
      relations: ['tags', 'crew', 'reviews'],
    });

    if (!anime) {
      throw new NotFoundException(ErrorMessageEnum.NOT_FOUND);
    }

    return new ResponseDto(
      StatusCodeEnum.OK,
      anime,
      ResponseMessageEnum.SUCCESS,
    );
  }

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto, user) {
    const anime = await this.animeRepository.findOne({
      where: {
        id,
      },
    });

    if (anime.user.id !== user.id) {
      throw new ForbiddenException();
    }

    const newAnime = await this.animeRepository.save({
      ...anime,
      ...updateAnimeDto,
    });

    return new ResponseDto(
      StatusCodeEnum.OK,
      newAnime,
      ResponseMessageEnum.UPDATE_SUCCESS,
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
}
