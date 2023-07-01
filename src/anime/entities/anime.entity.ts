import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Anime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  tag: string;

  @Column()
  source: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;
}
