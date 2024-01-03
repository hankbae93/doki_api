import { Injectable } from '@nestjs/common';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import { EResponseMessage } from '../../common/enum/message.enum';
import { TagRepository } from './repository/tag.repository';

@Injectable()
export class TagService {
  constructor(private tagRepository: TagRepository) {}
  async getTags() {
    const tags = await this.tagRepository.find();

    return new ResponseDto(EStatusCode.OK, tags, EResponseMessage.SUCCESS);
  }
}
