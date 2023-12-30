import { User } from '../user/entities/user.entity';
import { Anime } from '../anime/entities/anime.entity';
import { Review } from '../review/entities/review.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Scrap } from '../scrap/entities/scrap.entity';
import { Image } from '../anime/entities/image.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

const config: {
  typeOrmModuleOption: TypeOrmModuleOptions;
} = {
  typeOrmModuleOption: {
    type: 'mariadb',
    host: 'localhost',
    port: 13306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'doki_db',
    entities: [User, Anime, Review, Tag, Scrap, Image],
    synchronize: true,
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
  },
};

export default config;
