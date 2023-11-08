import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { Video } from './entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Anime, Video])],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
