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
import { Review } from '../../review/entities/review.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Tag } from '../../tag/entities/tag.entity';
import { File } from '../../file/entities/file.entity';

@Entity()
export class Anime extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 50, nullable: true })
  author: string;

  @Column({ length: 50, nullable: true })
  crew: string;

  @Column('longtext')
  description: string;

  @Column()
  thumbnail: string;

  @Column('enum', { enum: AnimeSource, default: AnimeSource.ORIGINAL })
  source: AnimeSource;

  @Column({ nullable: true })
  animeParentId: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageScore: number;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Review, (review) => review.anime)
  reviews: Review[];

  @OneToMany(() => Scrap, (scrap) => scrap.anime)
  scraps: Scrap[];

  @OneToMany(() => File, (image) => image.anime)
  images: File[];

  @ManyToOne(() => User, (user) => user.animes, { eager: false })
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_animes' })
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.animes)
  @JoinTable()
  tags: Tag[];
}
