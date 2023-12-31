import { Module } from '@nestjs/common';
import { AnimeModule } from './anime/anime.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { ScrapModule } from './scrap/scrap.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AnimeModule,
    UserModule,
    TagModule,
    ReviewModule,
    ScrapModule,
  ],
})
export class AppModule {}
