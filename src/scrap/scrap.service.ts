import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateScrapDto } from './dto/update-scrap.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Scrap } from './entities/scrap.entity';
import { Repository } from 'typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EResponseMessage } from '../common/enum/message.enum';

@Injectable()
export class ScrapService {
  constructor(
    @InjectRepository(Scrap)
    private scrapRepository: Repository<Scrap>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}

  async getMyScraps(user: User) {
    const scraps = await this.scrapRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['anime'],
    });

    return new ResponseDto(EStatusCode.OK, scraps, EResponseMessage.SUCCESS);
  }
  async scrapAnime(animeId: number, user: User) {
    const anime = await this.animeRepository.findOne({
      where: {
        id: animeId,
      },
    });

    const isScrapped = await this.scrapRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        anime: {
          id: animeId,
        },
      },
    });

    if (isScrapped) {
      return new ForbiddenException('이미 스크랩으로 등록되었습니다.');
    }

    const newScrap = await this.scrapRepository.create({
      user,
      anime,
    });

    await this.scrapRepository.insert(newScrap);

    return new ResponseDto(
      EStatusCode.CREATED,
      newScrap,
      EResponseMessage.SUCCESS,
    );
  }

  async removeScrapedAnime(animeId: number, user: User) {
    const scrap = await this.scrapRepository.findOne({
      where: {
        anime: {
          id: animeId,
        },
        user: {
          id: user.id,
        },
      },
      relations: ['user'],
    });

    if (scrap.user.id !== user.id) {
      return new UnauthorizedException('누구십니까');
    }

    await this.scrapRepository.remove(scrap);

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
  }

  findAll() {
    return `This action returns all scrap`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scrap`;
  }

  update(id: number, updateScrapDto: UpdateScrapDto) {
    return `This action updates a #${id} scrap`;
  }

  remove(id: number) {
    return `This action removes a #${id} scrap`;
  }
}
