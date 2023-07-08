import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AnimeSource } from '../anime.enum';

@Entity()
export class Anime extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  tag: string;

  @Column()
  source: AnimeSource;

  @ManyToOne(() => User, (user) => user.animes, { eager: true })
  user: User;
}
