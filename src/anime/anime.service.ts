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

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}
  async createAnime(createAnimeDto: CreateAnimeDto, user: User) {
    const { title, author, tag, source } = createAnimeDto;

    const newAnime = this.animeRepository.create({
      title,
      tag,
      source,
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
    const anime = await this.animeRepository.findOneBy({ id });

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
