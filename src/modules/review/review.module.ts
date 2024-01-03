import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { Review } from './entities/review.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ReviewRepository } from './repository/review.repository';
import { AnimeRepository } from '../anime/repository/anime.repository';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Anime, User]), AuthModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, AnimeRepository, UserRepository],
})
export class ReviewModule {}
