import { Module } from '@nestjs/common';
import { AnimeModule } from './modules/anime/anime.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import { ReviewModule } from './modules/review/review.module';
import { ScrapModule } from './modules/scrap/scrap.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { DatabaseModule } from './provider/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    UserModule,
    AnimeModule,
    TagModule,
    ReviewModule,
    ScrapModule,
  ],
})
export class AppModule {}
