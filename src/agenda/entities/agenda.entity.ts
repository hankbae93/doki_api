import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AgendaOption } from './agenda-option.entity';
import { AgendaVote } from './agenda-vote.entity';

@Entity()
export class Agenda extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.agendas)
  user: User;

  @Column()
  title: string;

  @Column({ nullable: true })
  complete: boolean;

  @OneToMany(() => AgendaOption, (agendaOption) => agendaOption.agenda)
  agendaOptions: AgendaOption[];

  @OneToMany(() => AgendaVote, (agendaVote) => agendaVote.agenda)
  agendaVotes: AgendaVote[];
}
