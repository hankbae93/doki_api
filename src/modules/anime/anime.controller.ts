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
import { AnimeWriteService } from './service/anime.write.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../../common/utils/file-uploading.util';
import { AnimeReadService } from './service/anime.read.service';

@Controller('anime')
export class AnimeController {
  constructor(
    private readonly animeWriteService: AnimeWriteService,
    private readonly animeReadService: AnimeReadService,
  ) {}

  @Get()
  getAnimeList(@Query() getAllAnimeQueryDto: GetAllAnimeQueryDto) {
    return this.animeReadService.getAnimeList(getAllAnimeQueryDto);
  }

  @Get('/auth')
  @UseGuards(AuthGuard())
  getAnimeListByUser(
    @Query() getAllAnimeQueryDto: GetAllAnimeQueryDto,
    @GetUser() user: User,
  ) {
    return this.animeReadService.getAnimeListByUser(getAllAnimeQueryDto, user);
  }

  @Get('/series')
  getAnimeSeries() {
    return this.animeReadService.getAnimeSeries();
  }

  @Get('/series/:seriesId')
  getAnimeSeriesBySeriesId(@Param('seriesId', ParseIntPipe) seriesId: number) {
    return this.animeReadService.getAnimesBySeriesId(seriesId);
  }

  @Get('/:id')
  @UseGuards()
  getAnimeDetail(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user?: User,
  ) {
    return this.animeReadService.getAnimeDetail(id, user);
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
    return this.animeWriteService.createAnime(createAnimeDto, files, user);
  }

  @Post('/:id')
  @UseGuards(AuthGuard())
  updateAnime(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
    @GetUser() user: User,
  ) {
    return this.animeWriteService.updateAnime(id, updateAnimeDto, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  removeAnime(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.animeWriteService.deleteAnime(id, user);
  }
}
