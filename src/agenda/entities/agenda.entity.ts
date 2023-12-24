import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
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

  @Column()
  title: string;

  @Column({ nullable: true })
  complete: boolean;

  @OneToMany(() => AgendaOption, (agendaOption) => agendaOption.agenda)
  agendaOptions: AgendaOption[];

  @OneToMany(() => AgendaVote, (agendaVote) => agendaVote.agenda)
  agendaVotes: AgendaVote[];

  @ManyToOne(() => User, (user) => user.agendas)
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_agendas' })
  user: User;
}
