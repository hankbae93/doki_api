import { Controller, Get, Param, Res } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Get(':path')
  getAmazingFile(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './files' });
  }
}
