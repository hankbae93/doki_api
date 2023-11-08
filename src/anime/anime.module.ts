import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { UserModule } from '../user/user.module';
import { Crew } from '../crew/entities/crew.entity';
import { Review } from '../review/entities/review.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { Image } from '../image/entities/image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { Video } from '../video/entities/video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime, Crew, Review, Tag, Scrap, Image, Video]),
    UserModule,
    MulterModule.register({
      dest: './files',
    }),
  ],
  controllers: [AnimeController],
  providers: [AnimeService],
})
export class AnimeModule {}
