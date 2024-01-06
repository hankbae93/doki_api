import { Injectable } from '@nestjs/common';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import { EResponseMessage } from '../../common/enum/message.enum';
import { TagRepository } from './repository/tag.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class TagService {
  constructor(private tagRepository: TagRepository) {}
  async getTags() {
    const tags = await this.tagRepository.find();

    return new ResponseDto(EStatusCode.OK, tags, EResponseMessage.SUCCESS);
  }

  async findTagsAndCreate(tags: string[], entityManager?: EntityManager) {
    if (!tags || tags.length === 0) return [];

    const tagRecords = await this.tagRepository.findTagsByName(
      tags,
      entityManager,
    );

    const needCreatedTag = tags.filter(
      (tag) => !tagRecords.some((tagRecord) => tagRecord.name === tag),
    );

    const newTags = await this.tagRepository.createTag(
      needCreatedTag,
      entityManager,
    );

    return tagRecords.concat(newTags);
  }
}
