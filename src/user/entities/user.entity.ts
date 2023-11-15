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
import { UserRank } from '../user.enum';
import { Agenda } from '../../agenda/entities/agenda.entity';

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

  @Column('longtext')
  description: string;

  @Column()
  profile: string;

  @Column()
  rank: UserRank;

  @Column()
  createdAt: string;

  @OneToMany(() => Anime, (anime) => anime.user)
  animes: Anime[];

  @OneToMany(() => Scrap, (scrap) => scrap.user)
  scraps: Scrap[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Agenda, (agenda) => agenda.user)
  agendas: Agenda[];
}
