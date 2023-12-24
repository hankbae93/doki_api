import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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
import { Tag } from '../../tag/entities/tag.entity';
import { Image } from '../../image/entities/image.entity';
import { Video } from '../../video/entities/video.entity';

@Entity()
export class Anime extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  author: string;

  @Column('longtext', { nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column()
  source: AnimeSource;

  @Column({ nullable: true })
  animeParentId: number;

  @Column()
  averageScore: number;

  @OneToMany(() => Review, (review) => review.anime)
  reviews: Review[];

  @OneToMany(() => Scrap, (scrap) => scrap.anime)
  scraps: Scrap[];

  @OneToMany(() => Image, (image) => image.anime)
  images: Image[];

  @OneToMany(() => Video, (video) => video.anime)
  videos: Video[];

  @ManyToOne(() => User, (user) => user.animes, { eager: false })
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_animes' })
  user: User;

  @ManyToOne(() => Crew, (crew) => crew.animes, { eager: false })
  crew: Crew;

  @ManyToOne(() => Song, (song) => song.anime)
  songs: Song[];

  @ManyToMany(() => Tag, (tag) => tag.animes)
  @JoinTable()
  tags: Tag[];
}
