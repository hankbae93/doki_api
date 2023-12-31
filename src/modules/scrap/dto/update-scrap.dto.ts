import { PartialType } from '@nestjs/swagger';
import { CreateScrapDto } from './create-scrap.dto';

export class UpdateScrapDto extends PartialType(CreateScrapDto) {}
