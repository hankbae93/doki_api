import { Module } from '@nestjs/common';
import { CrewService } from './crew.service';
import { CrewController } from './crew.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crew } from './entities/crew.entity';
import { Anime } from '../anime/entities/anime.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Crew, Anime]), UserModule],
  controllers: [CrewController],
  providers: [CrewService],
})
export class CrewModule {}
