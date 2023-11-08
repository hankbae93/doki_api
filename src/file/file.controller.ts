import { Controller, Get, Param, Res } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('/video/:path')
  getAmazingVideo(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './videos' });
  }

  @Get(':path')
  getAmazingFile(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './files' });
  }
}
