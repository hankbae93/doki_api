import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgendaPeriodType } from '../agenda.enum';
import { AgendaCandidate } from './agenda-candidate.entity';

@Entity()
export class AgendaPeriod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column()
  type: AgendaPeriodType;

  @OneToMany(
    () => AgendaCandidate,
    (agendaCandidate) => agendaCandidate.agendaPeriod,
  )
  agendaCandidates: AgendaCandidate[];
}
