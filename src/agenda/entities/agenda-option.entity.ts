import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agenda } from './agenda.entity';
import { AgendaVote } from './agenda-vote.entity';

@Entity()
export class AgendaOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  content: string;

  @Column()
  win: boolean;

  @ManyToOne(() => Agenda, (agenda) => agenda.agendaOptions)
  agenda: Agenda;

  @OneToMany(() => AgendaVote, (agendaVote) => agendaVote.agendaOption)
  agendaVotes: AgendaVote[];
}
