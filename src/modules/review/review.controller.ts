import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/anime/my/:animeId')
  @UseGuards(AuthGuard())
  getMyReviewByAnime(
    @Param('animeId', ParseIntPipe) animeId: number,
    @GetUser() user: User,
  ) {
    return this.reviewService.getMyReviewByAnime(animeId, user);
  }

  @Post('/anime/:animeId')
  @UseGuards(AuthGuard())
  createReviewByAnime(
    @Body() createReviewDto: CreateReviewDto,
    @Param('animeId', ParseIntPipe) animeId: number,
    @GetUser() user: User,
  ) {
    return this.reviewService.createReviewByAnime(
      createReviewDto,
      animeId,
      user,
    );
  }

  @Post(':id')
  @UseGuards(AuthGuard())
  updateMyReview(
    @Body() updateReviewDto: UpdateReviewDto,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.reviewService.updateMyReview(updateReviewDto, id, user);
  }
}
