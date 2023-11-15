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

@Entity()
export class Agenda extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.agendas)
  user: User;

  @Column()
  title: string;

  @OneToMany(() => AgendaOption, (agendaOption) => agendaOption.agenda)
  options: AgendaOption[];
}
