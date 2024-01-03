import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { FileType } from '../file.enum';

@Entity()
@Unique(['fileName'])
export class File extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fileName: string;

  @Column('enum', { enum: FileType, nullable: true })
  type: FileType;

  @ManyToOne(() => Anime, (anime) => anime.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_anime_files' })
  anime: Anime;
}
