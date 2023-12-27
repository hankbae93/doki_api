import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Scrap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Anime, (anime) => anime.scraps)
  @JoinColumn({ foreignKeyConstraintName: 'fk_anime_scraps' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.scraps)
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_scraps' })
  user: User;
}
