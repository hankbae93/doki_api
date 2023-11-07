import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';

@Entity()
@Unique(['fileName'])
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    nullable: false,
  })
  fileName: string;

  @ManyToOne(() => Anime, (anime) => anime.images)
  anime: Anime;
}
