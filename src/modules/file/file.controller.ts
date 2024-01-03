import { Controller, Get, Param, Res } from '@nestjs/common';

@Controller('files')
export class FileController {
  constructor() {}

  @Get('/:path')
  getAmazingFile(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './files' });
  }
}
