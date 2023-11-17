import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  getAgendaList() {
    return this.agendaService.getAgendaList();
  }

  @Post('/create')
  @UseGuards(AuthGuard())
  createAgenda(
    @Body() createAgendaDto: CreateAgendaDto,
    @GetUser() user: User,
  ) {
    return this.agendaService.createAgenda(createAgendaDto, user);
  }

  @Post('/period/create')
  @UseGuards(AuthGuard())
  createPeriod() {
    return this.agendaService.createPeriod();
  }

  @Post('/candidate/result')
  @UseGuards(AuthGuard())
  getWinnerAgendaThisWeek(){
    return this.agendaService.getWinnerAgendaThisWeek()
  }

  @Post('/candidate/:agendaId')
  @UseGuards(AuthGuard())
  candidateAgenda(
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @GetUser() user: User,
  ) {
    return this.agendaService.candidateAgenda(agendaId, user);
  }


}
