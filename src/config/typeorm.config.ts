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
import { Image } from '../modules/anime/entities/image.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'doki_db',
      entities: [User, Anime, Review, Tag, Scrap, Image],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  },
};
