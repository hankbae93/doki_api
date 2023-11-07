import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { UserModule } from '../user/user.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime]),
    UserModule,
    MulterModule.register({
      dest: './files',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
