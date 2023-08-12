import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AnimeSource } from '../anime.enum';
import { Crew } from '../../crew/entities/crew.entity';
import { Review } from '../../review/entities/review.entity';
import { Song } from '../../song/entities/song.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';

@Entity()
export class Anime extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column()
  source: AnimeSource;

  @Column({ nullable: true })
  animeParentId: string;

  @Column()
  averageScore: number;

  @OneToMany(() => Review, (review) => review.anime)
  reviews: Review[];

  @OneToMany(() => Scrap, (scrap) => scrap.anime)
  scraps: Scrap[];

  @ManyToOne(() => User, (user) => user.animes, { eager: false })
  user: User;

  @ManyToOne(() => Crew, (crew) => crew.animes, { eager: false })
  crew: Crew;

  @ManyToOne(() => Song, (song) => song.anime)
  songs: Song[];
}
