import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agenda } from './agenda.entity';
import { AgendaPeriod } from './agenda-period.entity';
import { AgendaCandidateVote } from './agenda-canidate-vote.entity';

@Entity()
export class AgendaCandidate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToOne(() => Agenda)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @OneToMany(
    () => AgendaCandidateVote,
    (agendaCandidateVote) => agendaCandidateVote.agendaCandidate,
  )
  agendaCandidateVotes: AgendaCandidateVote[];

  @ManyToOne(
    () => AgendaPeriod,
    (agendaPeriod) => agendaPeriod.agendaCandidates,
  )
  agendaPeriod: AgendaPeriod;
}
