import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  content: string;

  @Column()
  img: string;

  @Column()
  score: number;

  @ManyToOne(() => Anime, (anime) => anime.reviews)
  anime: Anime;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;
}
