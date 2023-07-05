import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  getAllAnime() {
    return this.animeService.getAllAnime();
  }

  @Get(':id')
  getAnime(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.getAnime(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  create(@Body() createAnimeDto: CreateAnimeDto, @GetUser() user: User) {
    return this.animeService.createAnime(createAnimeDto, user);
  }

  @Post(':id')
  @UseGuards(AuthGuard())
  updateAnime(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
    @GetUser() user: User,
  ) {
    return this.animeService.updateAnime(id, updateAnimeDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  removeAnime(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.animeService.removeAnime(id, user);
  }
}
