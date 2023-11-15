import { Injectable } from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './entities/agenda.entity';
import { AgendaOption } from './entities/agenda-option.entity';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { StatusCodeEnum } from '../common/enum/status.enum';
import { ResponseMessageEnum } from '../common/enum/message.enum';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,

    @InjectRepository(AgendaOption)
    private agendaOptionRepository: Repository<AgendaOption>,
  ) {}
  async createAgenda(createAgendaDto: CreateAgendaDto, user: User) {
    const { title, options } = createAgendaDto;

    const newAgenda = await this.agendaRepository.save({
      title,
      user,
    });

    const newAgendaOptions = await this.agendaOptionRepository.save(
      options.map((content) => ({
        content,
        agenda: newAgenda,
      })),
    );

    return new ResponseDto(
      StatusCodeEnum.CREATED,
      {
        title: newAgenda.title,
        options: newAgendaOptions.map((option) => ({
          id: option.id,
          content: option.content,
        })),
      },
      ResponseMessageEnum.SUCCESS,
    );
  }
}
