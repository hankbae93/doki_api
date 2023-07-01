import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  getAnime(@Param('id') id: string) {
    return this.animeService.getAnime(+id);
  }

  @Post()
  create(@Body() createAnimeDto: CreateAnimeDto) {
    return this.animeService.createAnime(createAnimeDto);
  }

  @Post(':id')
  updateAnime(@Param('id') id: string, @Body() updateAnimeDto: UpdateAnimeDto) {
    return this.animeService.updateAnime(+id, updateAnimeDto);
  }

  @Delete(':id')
  removeAnime(@Param('id') id: string) {
    return this.animeService.removeAnime(+id);
  }
}
