import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('scrap')
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  @Get()
  @UseGuards(AuthGuard())
  findAll(@GetUser() user: User) {
    return this.scrapService.getMyScraps(user);
  }

  @Post(':animeId')
  @UseGuards(AuthGuard())
  scrapAnime(
    @Param('animeId', ParseIntPipe) animeId: number,
    @GetUser() user: User,
  ) {
    return this.scrapService.scrapAnime(animeId, user);
  }

  @Post('/remove/:animeId')
  @UseGuards(AuthGuard())
  removeScrapedAnime(
    @Param('animeId', ParseIntPipe) animeId: number,
    @GetUser() user: User,
  ) {
    return this.scrapService.removeScrapedAnime(animeId, user);
  }
}
