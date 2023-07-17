import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';

@Entity()
export class Song extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  singer: string;

  @Column()
  link: string;

  @ManyToOne(() => Anime, (anime) => anime.songs)
  anime: Anime;
}
