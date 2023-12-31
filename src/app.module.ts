import { Module } from '@nestjs/common';
import { AnimeModule } from './modules/anime/anime.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import { ReviewModule } from './modules/review/review.module';
import { ScrapModule } from './modules/scrap/scrap.module';
import { typeOrmConfig } from './config/typeorm.config';
import { MulterModule } from '@nestjs/platform-express';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV === 'production' ? `.env.${ENV}` : '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MulterModule.register({
      dest: './files',
    }),
    AnimeModule,
    UserModule,
    TagModule,
    ReviewModule,
    ScrapModule,
  ],
})
export class AppModule {}
