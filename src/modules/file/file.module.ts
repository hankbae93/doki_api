import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { CloudStorageService } from './cloud-storage.service';

@Module({
  controllers: [FileController],
  providers: [CloudStorageService],
  exports: [CloudStorageService],
})
export class FileModule {}
