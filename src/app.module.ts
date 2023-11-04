import { Module } from '@nestjs/common';
import { AnimeModule } from './anime/anime.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Anime } from './anime/entities/anime.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CrewModule } from './crew/crew.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { SongModule } from './song/song.module';
import { Review } from './review/entities/review.entity';
import { Tag } from './tag/entities/tag.entity';
import { Song } from './song/entities/song.entity';
import { Crew } from './crew/entities/crew.entity';
import { ScrapModule } from './scrap/scrap.module';
import { Scrap } from './scrap/entities/scrap.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 13306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'doki_db',
      entities: [User, Anime, Review, Tag, Song, Crew, Scrap],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    AnimeModule,
    UserModule,
    CrewModule,
    TagModule,
    ReviewModule,
    SongModule,
    ScrapModule,
  ],
})
export class AppModule {}
