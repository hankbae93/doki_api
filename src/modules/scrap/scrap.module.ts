import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { ScrapController } from './scrap.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Scrap } from './entities/scrap.entity';
import { Anime } from '../anime/entities/anime.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scrap, Anime, User]), UserModule],
  controllers: [ScrapController],
  providers: [ScrapService],
})
export class ScrapModule {}
