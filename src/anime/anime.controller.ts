import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../utils/file-uploading.util';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  getAnimeList(@Query() getAllAnimeQueryDto: GetAllAnimeQueryDto) {
    return this.animeService.getAnimeList(getAllAnimeQueryDto);
  }

  @Get('/auth')
  @UseGuards(AuthGuard())
  getAnimeListByUser(
    @Query() getAllAnimeQueryDto: GetAllAnimeQueryDto,
    @GetUser() user: User,
  ) {
    return this.animeService.getAnimeListByUser(getAllAnimeQueryDto, user);
  }

  @Get('/emile')
  getEmile(@Query() getAllAnimeQueryDto: GetAllAnimeQueryDto) {
    return this.animeService.test(getAllAnimeQueryDto);
  }

  @Get('/series')
  getAnimeSeries() {
    return this.animeService.getAnimeSeries();
  }

  @Get('/series/:seriesId')
  getAnimeSeriesBySeriesId(@Param('seriesId', ParseIntPipe) seriesId: number) {
    return this.animeService.getAnimesBySeriesId(seriesId);
  }

  @Get(':id')
  @UseGuards()
  getAnimeDetail(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user?: User,
  ) {
    return this.animeService.getAnimeDetail(id, user);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 5 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './files',
          filename: editFileName,
        }),
      },
    ),
  )
  async createAnime(
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
    @Body() createAnimeDto: CreateAnimeDto,
    @GetUser() user?: User,
  ) {
    return this.animeService.createAnime(createAnimeDto, files, user);
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
