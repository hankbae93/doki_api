import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Agenda } from './entities/agenda.entity';
import { AgendaOption } from './entities/agenda-option.entity';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { AgendaCandidate } from './entities/agenda-candidate.entity';
import { AgendaCandidateVote } from './entities/agenda-canidate-vote.entity';
import { AgendaPeriodService } from './agenda-period.service';
import { AgendaVote } from './entities/agenda-vote.entity';
import { AgendaSchedulerService } from './agenda-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agenda,
      AgendaOption,
      AgendaPeriod,
      AgendaCandidate,
      AgendaCandidateVote,
      AgendaVote,
    ]),
    UserModule,
  ],
  controllers: [AgendaController],
  providers: [AgendaService, AgendaPeriodService, AgendaSchedulerService],
})
export class AgendaModule {}
