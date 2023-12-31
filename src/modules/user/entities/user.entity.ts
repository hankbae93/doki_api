import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';
import { UserRank } from '../user.enum';

@Entity()
@Unique('uq_user_email', ['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'email', length: 50 })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('varchar', { name: 'nickname', length: 20 })
  nickname: string;

  @Column('varchar', { length: 1000, nullable: true })
  description: string;

  @Column({ nullable: true })
  profile: string;

  @Column({ default: false })
  retired: boolean;

  @Column('enum', { enum: UserRank, default: UserRank.d })
  rank: UserRank;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Anime, (anime) => anime.user)
  animes: Anime[];

  @OneToMany(() => Scrap, (scrap) => scrap.user)
  scraps: Scrap[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
