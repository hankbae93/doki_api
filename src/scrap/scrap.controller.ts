import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { UpdateScrapDto } from './dto/update-scrap.dto';

@Controller('scrap')
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  @Post()
  create(@Body() createScrapDto: CreateScrapDto) {
    return this.scrapService.create(createScrapDto);
  }

  @Get()
  findAll() {
    return this.scrapService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scrapService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScrapDto: UpdateScrapDto) {
    return this.scrapService.update(+id, updateScrapDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scrapService.remove(+id);
  }
}
