import { Module } from '@nestjs/common';
import { AnimeModule } from './modules/anime/anime.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import { ReviewModule } from './modules/review/review.module';
import { ScrapModule } from './modules/scrap/scrap.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { diskStorage } from 'multer';
import * as path from 'path';
import { DatabaseModule } from './provider/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    DatabaseModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './files', // or any path you wish to store files
        filename: (req, file, callback) => {
          const fileExtName = path.extname(file.originalname);
          const sanitizedFilename = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^\x00-\x7F]/g, '');
          callback(null, `anime-${sanitizedFilename}${fileExtName}`);
        },
      }),
    }),
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
