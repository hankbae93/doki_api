import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgendaCandidate } from './agenda-candidate.entity';
import { Agenda } from './agenda.entity';
import { User } from '../../user/entities/user.entity';
import { AgendaOption } from './agenda-option.entity';

@Entity()
export class AgendaVote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  win: boolean;

  @ManyToOne(
    () => AgendaCandidate,
    (agendaCandidate) => agendaCandidate.agendaVotes,
  )
  agendaCandidate: AgendaCandidate;

  @ManyToOne(() => Agenda, (Agenda) => Agenda.agendaVotes)
  agenda: Agenda;

  @ManyToOne(() => AgendaOption, (agendaOption) => agendaOption.agendaVotes)
  agendaOption: AgendaOption;

  @ManyToOne(() => User, (user) => user.agendaVotes)
  user: User;
}
