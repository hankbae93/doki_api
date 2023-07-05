import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';

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
  @UsePipes(ValidationPipe)
  create(@Body() createAnimeDto: CreateAnimeDto) {
    return this.animeService.createAnime(createAnimeDto);
  }

  @Post(':id')
  updateAnime(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
  ) {
    return this.animeService.updateAnime(id, updateAnimeDto);
  }

  @Delete(':id')
  removeAnime(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.removeAnime(id);
  }
}
