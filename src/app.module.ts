import { Module } from '@nestjs/common';
import { AnimeModule } from './anime/anime.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { ScrapModule } from './scrap/scrap.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(config.typeOrmModuleOption),
    AnimeModule,
    UserModule,
    TagModule,
    ReviewModule,
    ScrapModule,
  ],
})
export class AppModule {}
