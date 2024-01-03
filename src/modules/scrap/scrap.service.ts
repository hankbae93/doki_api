import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../../common/dto/responseDto';
import { EStatusCode } from '../../common/enum/status.enum';
import { EResponseMessage } from '../../common/enum/message.enum';
import { ScrapRepository } from './repository/scrap.repository';
import { AnimeRepository } from '../anime/repository/anime.repository';

@Injectable()
export class ScrapService {
  constructor(
    private scrapRepository: ScrapRepository,
    private animeRepository: AnimeRepository,
  ) {}

  async getMyScraps(user: User) {
    const scraps = await this.scrapRepository.getScrapByUserId(user.id);

    return new ResponseDto(EStatusCode.OK, scraps, EResponseMessage.SUCCESS);
  }
  async scrapAnime(animeId: number, user: User) {
    const anime = await this.animeRepository.findAnimeById(animeId);
    const scrap = await this.scrapRepository.getScrapsByIds(animeId, user.id);

    if (scrap) {
      return new ForbiddenException('이미 스크랩으로 등록되었습니다.');
    }

    const newScrap = await this.scrapRepository.createScrap(user, anime);

    return new ResponseDto(
      EStatusCode.CREATED,
      newScrap,
      EResponseMessage.SUCCESS,
    );
  }

  async removeScrapedAnime(animeId: number, user: User) {
    const scrap = await this.scrapRepository.getScrapsByIds(animeId, user.id, [
      'user',
    ]);

    if (scrap.user.id !== user.id) {
      return new UnauthorizedException('누구십니까');
    }

    await this.scrapRepository.remove(scrap);

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
  }
}
