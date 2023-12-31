import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { UserModule } from '../user/user.module';
import { Review } from '../review/entities/review.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { Image } from './entities/image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { AnimeRepository } from './repository/anime.repository';
import { ScrapRepository } from './repository/scrap.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Review, Tag, Scrap, Image]),
    UserModule,
    MulterModule.register({
      dest: './files',
    }),
  ],
  controllers: [AnimeController],
  providers: [AnimeService, AnimeRepository, ScrapRepository],
})
export class AnimeModule {}
