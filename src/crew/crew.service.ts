import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crew } from './entities/crew.entity';
import { Repository } from 'typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { ResponseDto } from '../common/dto/responseDto';
import {
  ErrorMessageEnum,
  ResponseMessageEnum,
} from '../common/enum/message.enum';
import { StatusCodeEnum } from '../common/enum/status.enum';

@Injectable()
export class CrewService {
  constructor(
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}

  async getCrewList() {
    const crewList = await this.crewRepository
      .createQueryBuilder('crew')
      .leftJoin(Anime, 'anime', 'anime.crew_id = crew.id')
      .select([
        'crew.id as id',
        'crew.name as name',
        'anime.thumbnail as thumbnail',
      ])
      .groupBy('crew.name')
      .getRawMany();

    return new ResponseDto(
      StatusCodeEnum.OK,
      {
        crews: crewList,
      },
      ResponseMessageEnum.SUCCESS,
    );
  }

  async getCrewDetail(id: number) {
    const crew = await this.crewRepository.findOne({
      where: {
        id,
      },
      relations: ['animes'],
    });

    if (!crew) {
      throw new NotFoundException(ErrorMessageEnum.NOT_FOUND);
    }

    return new ResponseDto(
      StatusCodeEnum.OK,
      { crew },
      ResponseMessageEnum.SUCCESS,
    );
  }
}
