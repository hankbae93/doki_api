import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/user/entities/user.entity';
import { Anime } from '../modules/anime/entities/anime.entity';
import { Review } from '../modules/review/entities/review.entity';
import { Tag } from '../modules/tag/entities/tag.entity';
import { Scrap } from '../modules/scrap/entities/scrap.entity';
import { File } from '../modules/file/entities/file.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as process from 'process';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      type: process.env.DB_TYPE as 'mysql' | 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      entities: [User, Anime, Review, Tag, Scrap, File],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  },
};
