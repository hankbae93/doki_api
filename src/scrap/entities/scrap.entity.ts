import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Scrap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Anime, (anime) => anime.scraps)
  anime: Anime;

  @ManyToOne(() => User, (user) => user.scrap)
  user: User;
}
