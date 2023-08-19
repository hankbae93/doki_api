import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';

@Entity()
@Unique(['email', 'nickname'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  nickname: string;

  @Column()
  description: string;

  @OneToMany(() => Anime, (anime) => anime.user)
  animes: Anime[];

  @OneToMany(() => Scrap, (scrap) => scrap.user)
  scraps: Scrap[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
