import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EResponseMessage } from '../common/enum/message.enum';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private tagRepository: Repository<Tag>) {}
  async getTags() {
    const tags = await this.tagRepository.find();

    return new ResponseDto(EStatusCode.OK, tags, EResponseMessage.SUCCESS);
  }
}
