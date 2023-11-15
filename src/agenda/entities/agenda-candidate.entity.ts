import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agenda } from './agenda.entity';
import { AgendaPeriod } from './agenda-period.entity';

@Entity()
export class AgendaCandidate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToOne(() => Agenda)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @ManyToOne(
    () => AgendaPeriod,
    (agendaPeriod) => agendaPeriod.agendaCandidates,
  )
  agendaPeriod: AgendaPeriod;
}
