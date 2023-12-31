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
import {
  DESCRIPTION_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NICKNAME_MAX_LENGTH,
} from '../user.constant';

@Entity()
@Unique('uq_user_email', ['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'email', length: EMAIL_MAX_LENGTH })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('varchar', { name: 'nickname', length: NICKNAME_MAX_LENGTH })
  nickname: string;

  @Column('varchar', { length: DESCRIPTION_MAX_LENGTH, nullable: true })
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
