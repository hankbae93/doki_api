import { Injectable, NotFoundException } from '@nestjs/common';
import { AnimeRepository } from '../repository/anime.repository';
import { ScrapRepository } from '../../scrap/repository/scrap.repository';
import { ReviewRepository } from '../../review/repository/review.repository';
import { FileRepository } from '../../file/repository/file.repository';
import { TagRepository } from '../../tag/repository/tag.repository';
import { User } from '../../user/entities/user.entity';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../../common/enum/message.enum';
import { ResponseDto } from '../../../common/dto/response.dto';
import { EStatusCode } from '../../../common/enum/status.enum';
import { GetAllAnimeQueryDto } from '../dto/get-all-anime-query.dto';

@Injectable()
export class AnimeReadService {
  constructor(
    private animeRepository: AnimeRepository,
    private scrapRepository: ScrapRepository,
    private reviewRepository: ReviewRepository,
    private fileRepository: FileRepository,
    private tagRepository: TagRepository,
  ) {}

  async getAnimeDetail(id: number, user?: User) {
    const anime = await this.animeRepository.getAnimeDetailById(id);

    if (!anime) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    const scrap = user
      ? await this.scrapRepository.getScrapsByIds(id, user.id)
      : null;

    return new ResponseDto(
      EStatusCode.OK,
      { anime, isScrapped: !!scrap, scrapId: scrap?.id ?? null },
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
          data.push({ id: tag.id, name: tag.name });
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
    if (animes.length === 0) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

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
