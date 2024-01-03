import { Controller, Get, Param, Res } from '@nestjs/common';

@Controller('file')
export class FileController {
  constructor() {}

  @Get('/:path')
  getStaticFile(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './files' });
  }
}
