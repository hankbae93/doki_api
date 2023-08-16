import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateScrapDto } from './dto/update-scrap.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Scrap } from './entities/scrap.entity';
import { Repository } from 'typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { StatusCodeEnum } from '../common/enum/status.enum';
import { ResponseMessageEnum } from '../common/enum/message.enum';

@Injectable()
export class ScrapService {
  constructor(
    @InjectRepository(Scrap)
    private scrapRepository: Repository<Scrap>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}

  async scrapAnime(animeId: number, user: User) {
    const anime = await this.animeRepository.findOne({
      where: {
        id: animeId,
      },
    });

    const newScrap = await this.scrapRepository.create({
      user,
      anime,
    });

    await this.scrapRepository.save(newScrap);

    return new ResponseDto(
      StatusCodeEnum.CREATED,
      newScrap,
      ResponseMessageEnum.SUCCESS,
    );
  }

  async removeScrapedAnime(scrapId: number, user: User) {
    const scrap = await this.scrapRepository.findOne({
      where: {
        id: scrapId,
      },
      relations: ['user'],
    });

    if (scrap.user.id !== user.id) {
      return new UnauthorizedException('누구십니까');
    }

    await this.scrapRepository.remove(scrap);

    return new ResponseDto(
      StatusCodeEnum.OK,
      null,
      ResponseMessageEnum.DELETE_ITEM,
    );
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
