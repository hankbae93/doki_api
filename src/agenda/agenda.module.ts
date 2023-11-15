import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Agenda } from './entities/agenda.entity';
import { AgendaOption } from './entities/agenda-option.entity';
import { AgendaPeriod } from './entities/agenda-period.entity';
import { AgendaCandidate } from './entities/agenda-candidate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agenda,
      AgendaOption,
      AgendaPeriod,
      AgendaCandidate,
    ]),
    UserModule,
  ],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
