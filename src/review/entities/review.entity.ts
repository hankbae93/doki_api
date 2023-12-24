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
  img: string;

  @Column()
  score: number;

  @ManyToOne(() => Anime, (anime) => anime.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ foreignKeyConstraintName: 'fk_user_reviews' })
  user: User;
}
