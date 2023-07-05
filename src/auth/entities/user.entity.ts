import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';

@Entity()
@Unique(['email', 'nickname'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  description: string;

  @OneToMany(() => Anime, (anime) => anime.user, { eager: true })
  animes: Anime[];
}
