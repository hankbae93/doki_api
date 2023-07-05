import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AnimeResource } from '../anime.enum';

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
  source: AnimeResource;

  @ManyToOne(() => User, (user) => user.animes, { eager: false })
  user: User;
}
