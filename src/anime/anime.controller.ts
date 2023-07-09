import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { GetAllAnimeQueryDto } from './dto/get-all-anime-query.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Anime } from './entities/anime.entity';
import { StatusCodeEnum } from '../common/enum/status.enum';
import {
  ErrorMessageEnum,
  ResponseMessageEnum,
} from '../common/enum/message.enum';

@Controller('anime')
@ApiTags('Anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  @ApiOperation({
    summary: '전체 애니메이션 조회',
  })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    description: ResponseMessageEnum.SUCCESS,
  })
  getAllAnime(@Query() getAllAnimeQueryDto: GetAllAnimeQueryDto) {
    return this.animeService.getAllAnime(getAllAnimeQueryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '애니메이션 상세 조회',
  })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    description: ResponseMessageEnum.SUCCESS,
  })
  @ApiResponse({
    status: StatusCodeEnum.NOT_FOUND,
    description: ErrorMessageEnum.NOT_FOUND,
  })
  getAnime(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.getAnime(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '새 애니메이션 데이터 생성',
  })
  @ApiResponse({
    status: StatusCodeEnum.FORBIDEN,
  })
  @ApiResponse({
    status: StatusCodeEnum.CREATED,
    description: ResponseMessageEnum.SUCCESS,
  })
  @UseGuards(AuthGuard())
  createAnime(@Body() createAnimeDto: CreateAnimeDto, @GetUser() user: User) {
    return this.animeService.createAnime(createAnimeDto, user);
  }

  @Post(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '애니메이션 데이터 변경',
  })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    description: ResponseMessageEnum.SUCCESS,
  })
  @UseGuards(AuthGuard())
  updateAnime(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
    @GetUser() user: User,
  ) {
    return this.animeService.updateAnime(id, updateAnimeDto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '등록된 애니메이션 삭제',
  })
  @UseGuards(AuthGuard())
  removeAnime(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.animeService.removeAnime(id, user);
  }
}
