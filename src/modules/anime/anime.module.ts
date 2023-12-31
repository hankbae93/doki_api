import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Review } from '../review/entities/review.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { Image } from './entities/image.entity';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from '../scrap/repository/scrap.repository';
import { TagRepository } from '../tag/repository/tag.repository';
import { ReviewRepository } from '../review/repository/review.repository';
import { ImageRepository } from './repository/image.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Review, Tag, Scrap, Image]),
    AuthModule,
  ],
  controllers: [AnimeController],
  providers: [
    AnimeService,
    AnimeRepository,
    ImageRepository,
    ScrapRepository,
    TagRepository,
    ReviewRepository,
  ],
})
export class AnimeModule {}
