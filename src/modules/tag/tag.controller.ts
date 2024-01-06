import { Body, Controller, Get, Post } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  getTags() {
    return this.tagService.getTags();
  }

  @Post()
  findTagsAndCreate(@Body() dto: { tags: string[] }) {
    return this.tagService.findTagsAndCreate(dto.tags);
  }
}
