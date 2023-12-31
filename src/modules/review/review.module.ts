import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '../anime/entities/anime.entity';
import { Review } from './entities/review.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Anime, User]), UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
