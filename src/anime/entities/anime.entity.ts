import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Anime {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: string;

  @Column()
  author: string;

  @Column()
  tag: string;

  @Column()
  source: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
