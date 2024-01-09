import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  content: string;

  @Column()
  score: number;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => Anime, (anime) => anime.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_anime_reviews' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_reviews' })
  user: User;
}
