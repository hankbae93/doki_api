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
import { AgendaPeriodService } from './agenda-period.service';
import { VoteAgendaDto } from './dto/vote-agenda.dto';

@Controller('agenda')
export class AgendaController {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaPeriodService: AgendaPeriodService,
  ) {}

  @Get()
  getAgendaList() {
    return this.agendaService.getAgendaList();
  }

  @Get('/vote')
  getAgendaForVote() {
    return this.agendaService.getAgendaForVote();
  }

  @Get('/candidate/result/:periodId')
  getWinnerAgendaListByPeriod(
    @Param('periodId', ParseIntPipe) periodId: number,
  ) {
    return this.agendaService.getWinnerAgendaListByPeriod(periodId);
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
    return this.agendaPeriodService.createPeriod();
  }

  @Post('/vote/:agendaCandidateId')
  @UseGuards(AuthGuard())
  voteAgenda(
    @Param('agendaCandidateId', ParseIntPipe) agendaCandidateId: number,
    @Body() voteAgendaDto: VoteAgendaDto,
    @GetUser() user: User,
  ) {
    return this.agendaService.voteAgenda(
      agendaCandidateId,
      voteAgendaDto,
      user,
    );
  }

  @Post('/candidate/result')
  @UseGuards(AuthGuard())
  winAgendaThisWeek() {
    return this.agendaService.winAgendaThisWeek();
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
