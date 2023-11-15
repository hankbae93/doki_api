import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agenda } from './agenda.entity';

@Entity()
export class AgendaOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  content: string;

  @ManyToOne(() => Agenda, (agenda) => agenda.options)
  agenda: Agenda;
}
