import { Module } from '@nestjs/common';
import { AnimeModule } from './anime/anime.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Anime } from './anime/entities/anime.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { Review } from './review/entities/review.entity';
import { Tag } from './tag/entities/tag.entity';
import { ScrapModule } from './scrap/scrap.module';
import { Scrap } from './scrap/entities/scrap.entity';
import { ImageModule } from './image/image.module';
import { Image } from './image/entities/image.entity';
import { AgendaModule } from './agenda/agenda.module';
import { Agenda } from './agenda/entities/agenda.entity';
import { AgendaOption } from './agenda/entities/agenda-option.entity';
import { AgendaPeriod } from './agenda/entities/agenda-period.entity';
import { AgendaCandidate } from './agenda/entities/agenda-candidate.entity';
import { AgendaCandidateVote } from './agenda/entities/agenda-canidate-vote.entity';
import { AgendaVote } from './agenda/entities/agenda-vote.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 13306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'doki_db',
      entities: [
        User,
        Anime,
        Review,
        Tag,
        Scrap,
        Image,
        Agenda,
        AgendaOption,
        AgendaPeriod,
        AgendaCandidate,
        AgendaCandidateVote,
        AgendaVote,
      ],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    AnimeModule,
    UserModule,
    TagModule,
    ReviewModule,
    ScrapModule,
    ImageModule,
    AgendaModule,
  ],
})
export class AppModule {}
