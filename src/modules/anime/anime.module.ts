import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Review } from '../review/entities/review.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { File } from '../file/entities/file.entity';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from '../scrap/repository/scrap.repository';
import { TagRepository } from '../tag/repository/tag.repository';
import { ReviewRepository } from '../review/repository/review.repository';
import { FileRepository } from '../file/repository/file.repository';
import { AuthModule } from '../auth/auth.module';
import { TagService } from '../tag/tag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Review, Tag, Scrap, File]),
    AuthModule,
  ],
  controllers: [AnimeController],
  providers: [
    AnimeService,
    TagService,
    AnimeRepository,
    FileRepository,
    ScrapRepository,
    TagRepository,
    ReviewRepository,
  ],
})
export class AnimeModule {}
