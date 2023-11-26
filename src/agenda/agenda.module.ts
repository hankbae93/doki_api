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
import { AgendaVote } from './entities/agenda-vote.entity';
import { AgendaSchedulerService } from './agenda-scheduler.service';
import { AgendaRepository } from './repository/agenda.repository';
import { AgendaCandidateRepository } from './repository/agenda-candidate.repository';
import { AgendaPeriodRepository } from './repository/agenda-period.repository';
import { AgendaOptionRepository } from './repository/agenda-option.repository';
import { AgendaCandidateVoteRepository } from './repository/agenda-candidate-vote.repository';
import { AgendaVoteRepository } from './repository/agenda-vote.repository';

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
  providers: [
    AgendaService,
    AgendaSchedulerService,
    AgendaRepository,
    AgendaOptionRepository,
    AgendaCandidateRepository,
    AgendaPeriodRepository,
    AgendaCandidateVoteRepository,
    AgendaVoteRepository,
  ],
})
export class AgendaModule {}
