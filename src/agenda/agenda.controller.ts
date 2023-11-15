import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post('/create')
  @UseGuards(AuthGuard())
  createAgenda(
    @Body() createAgendaDto: CreateAgendaDto,
    @GetUser() user: User,
  ) {
    return this.agendaService.createAgenda(createAgendaDto, user);
  }
}
