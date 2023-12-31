import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { ScrapController } from './scrap.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scrap } from './entities/scrap.entity';
import { Anime } from '../anime/entities/anime.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Scrap, Anime, User]), AuthModule],
  controllers: [ScrapController],
  providers: [ScrapService],
})
export class ScrapModule {}
