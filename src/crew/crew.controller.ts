import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CrewService } from './crew.service';

@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Get()
  getCrewList() {
    return this.crewService.getCrewList();
  }

  @Get(':crewId')
  getCrewDetail(@Param('crewId', ParseIntPipe) crewId: number) {
    return this.crewService.getCrewDetail(crewId);
  }
}
